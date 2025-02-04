"use client";

import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { Loader2 } from 'lucide-react';

dayjs.extend(utc);
dayjs.extend(timezone);

type MessageType = {
  id: number;
  sender: string;
  recipient: string;
  message: string;
  track?: {
    spotify_embed_link?: string;
  };
  created_at: string;
};

export default function MessagePage() {
  const router = useRouter();
  const params = useParams();
  const [message, setMessage] = useState<MessageType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMessage = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`https://solifess.vercel.app/v1/api/menfess-spotify-search/${params.id}`);
        
        // Handle non-JSON responses
        const text = await response.text();
        const data = text ? JSON.parse(text) : {};

        if (!response.ok) {
          throw new Error(data.message || `HTTP error! status: ${response.status}`);
        }

        // Handle different response structures
        const messageData = data.data?.length > 0 ? data.data[0] : data.data;
        
        if (!messageData) {
          throw new Error('Message data not found in response');
        }

        // Transform Spotify embed URL if needed
        const transformedTrack = messageData.track?.spotify_embed_link 
          ? {
              ...messageData.track,
              spotify_embed_link: messageData.track.spotify_embed_link
                .replace('/track/', '/embed/track/')
                .replace('https://open.spotify.com/', 'https://open.spotify.com/embed/')
            }
          : null;

        setMessage({
          ...messageData,
          track: transformedTrack
        });

      } catch (error) {
        console.error("Error fetching message:", error);
        setError(error instanceof Error ? error.message : 'Terjadi kesalahan');
        setMessage(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) fetchMessage();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <p className="text-xl font-semibold text-gray-600 mb-4">{error}</p>
        <Button onClick={() => router.push('/')}>Kembali ke Beranda</Button>
      </div>
    );
  }

  if (!message) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl font-semibold text-gray-600">Message not found</p>
      </div>
    );
  }

  const formattedDate = dayjs.utc(message.created_at)
    .tz("Asia/Jakarta")
    .format("DD MMM YYYY, HH:mm");

  return (
    <div className="min-h-screen bg-white text-gray-800 flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-32">
        <Button
          onClick={() => router.back()}
          className="mb-8 bg-gray-800 text-white hover:bg-gray-900"
        >
          Back
        </Button>
        <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-8">
            <div className="mb-6">
              <p className="text-sm text-gray-500">To: {message.recipient}</p>
              <p className="text-sm text-gray-500">From: {message.sender}</p>
            </div>

            <div className="border-t border-b border-gray-200 py-6 space-y-6">
              <p className="text-sm text-gray-500 italic">
                There's someone sending you a song, they want you to hear this song that maybe you'll like :)
              </p>

              <p className="font-['Reenie_Beanie'] leading-relaxed text-4xl">
                {message.message}
              </p>

              {message.track?.spotify_embed_link && (
                <iframe
                  key={message.track.spotify_embed_link}
                  src={`${message.track.spotify_embed_link}?utm_source=generator&theme=0`}
                  width="100%"
                  height="153"
                  allowFullScreen
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  className="rounded-lg mt-6"
                  title="Spotify Music Player"
                />
              )}
            </div>

            <div className="mt-4 text-right">
              <p className="text-sm text-gray-500">Sent on: {formattedDate}</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}