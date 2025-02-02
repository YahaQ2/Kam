'use client';

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
      try {
        const response = await fetch(
          `https://unand.vercel.app/v1/api/menfess-spotify-search/${params.id}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('API Response:', data); // Untuk debugging

        if (data?.status && data?.data?.[0]) {
          const messageData = data.data[0];
          
          // Validasi Spotify embed link
          if (messageData.track?.spotify_embed_link) {
            const spotifyUrl = new URL(messageData.track.spotify_embed_link);
            if (!spotifyUrl.pathname.includes('/embed/')) {
              console.warn('URL Spotify mungkin bukan format embed');
            }
          }
          
          setMessage(messageData);
        } else {
          setError('Pesan tidak ditemukan');
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err instanceof Error ? err.message : 'Gagal memuat pesan');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessage();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
      </div>
    );
  }

  if (error || !message) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <p className="text-xl font-semibold text-red-600 mb-4">{error || 'Pesan tidak ditemukan'}</p>
        <Button onClick={() => router.back()} className="bg-gray-800 hover:bg-gray-900">
          Kembali
        </Button>
      </div>
    );
  }

  const formattedDate = dayjs.utc(message.created_at).tz("Asia/Jakarta").format("DD MMM YYYY, HH:mm");

  return (
    <div className="min-h-screen bg-white text-gray-800 flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-32">
        <div className="max-w-2xl mx-auto">
          <Button
            onClick={() => router.back()}
            className="mb-8 bg-gray-800 text-white hover:bg-gray-900"
          >
            Kembali
          </Button>
          
          <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
            <div className="p-6 md:p-8">
              <div className="mb-6 space-y-2">
                <p className="text-sm text-gray-600">
                  Kepada: <span className="font-medium">{message.recipient}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Dari: <span className="font-medium">{message.sender}</span>
                </p>
              </div>

              <div className="border-t border-b border-gray-200 py-6">
                <p className="font-['Reenie_Beanie'] text-4xl leading-relaxed mb-6">
                  {message.message}
                </p>

                {message.track?.spotify_embed_link && (
                  <div className="mt-6 rounded-lg overflow-hidden">
                    <iframe
                      title="Spotify Embed"
                      src={`${message.track.spotify_embed_link}?utm_source=generator`}
                      width="100%"
                      height="352"
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      loading="lazy"
                      className="bg-gray-100"
                      style={{ minHeight: '352px' }}
                    />
                  </div>
                )}
              </div>

              <div className="mt-4 text-right">
                <p className="text-sm text-gray-500">{formattedDate}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}