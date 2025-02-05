
"use client";

import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { Loader2 } from "lucide-react";

dayjs.extend(utc);
dayjs.extend(timezone);

type MessageType = {
  id: number;
  sender: string;
  recipient: string;
  message: string;
  gif_url: string;
  spotify_id?: string;
  created_at: string;
};

const SpotifyEmbed = ({ trackId }: { trackId?: string | null }) => {
  if (!trackId) return null;

  return (
    <iframe
      src={`https://open.spotify.com/embed/track/${trackId}?utm_source=generator`}
      width="100%"
      height="152"
      className="rounded-lg mt-6"
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"
    />
  );
};

export default function MessagePage() {
  const router = useRouter();
  const { id } = useParams();
  const [message, setMessage] = useState<MessageType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchMessage = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `https://unand.vercel.app/v1/api/menfess-spotify-search/${id}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!data?.status || !data?.data?.[0]) {
          throw new Error("Invalid data format");
        }

        const messageData = data.data[0];
        setMessage(messageData);
      } catch (error) {
        console.error("Error fetching message:", error);
        setMessage(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessage();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
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

  const formattedDate = dayjs
    .utc(message.created_at)
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
            <div className="border-t border-b border-gray-200 py-6">
              <p className="text-sm text-gray-500 italic">
                Seseorang mengirimkan lagu dan pesan untukmu, mungkin ini adalah
                lagu yang akan kamu sukai :)
              </p>
              <p className="font-['Reenie_Beanie'] leading-relaxed text-4xl">
                {message.message}
              </p>
              {message.gif_url && !imageError && (
                <div className="w-[240px] h-[240px] mx-auto my-6 relative">
                  <Image
                    src={message.gif_url}
                    alt="Gift from sender"
                    fill
                    className="rounded-lg object-cover"
                    onError={() => setImageError(true)}
                    unoptimized
                    sizes="240px"
                  />
                </div>
              )}
              {message.spotify_id && <SpotifyEmbed trackId={message.spotify_id} />}
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