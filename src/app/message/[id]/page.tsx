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
        const response = await fetch(
          `https://unand.vercel.app/v1/api/menfess-spotify-search/${params.id}`
        );
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Pesan tidak ditemukan');
          }
          throw new Error(`Gagal memuat pesan (Status: ${response.status})`);
        }

        const data = await response.json();

        if (data?.status && data.data) {
          setMessage(data.data); // Asumsi API mengembalikan objek langsung
        } else {
          throw new Error('Format respons tidak valid');
        }
      } catch (error) {
        console.error("Error:", error);
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
        <p className="text-xl font-semibold text-gray-600">Pesan tidak ditemukan</p>
      </div>
    );
  }

  const formattedDate = dayjs.utc(message.created_at)
    .tz("Asia/Jakarta")
    .format("DD MMM YYYY, HH:mm");

  return (
    <div className="min-h-screen bg-white text-gray-800 flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-2xl mx-auto">
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="mb-8 hover:bg-gray-50"
          >
            ← Kembali
          </Button>

          <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
            <div className="p-6 md:p-8 space-y-6">
              <div className="space-y-1">
                <p className="text-sm text-gray-500">
                  Untuk: <span className="font-medium text-gray-700">{message.recipient}</span>
                </p>
                <p className="text-sm text-gray-500">
                  Dari: <span className="font-medium text-gray-700">{message.sender}</span>
                </p>
              </div>

              <div className="space-y-6 border-t border-gray-200 pt-6">
                <p className="text-sm text-gray-500 italic">
                  Seseorang mengirimkan lagu untukmu, mungkin ini adalah lagu yang akan kamu sukai :)
                </p>

                <p className="font-['Reenie_Beanie'] text-4xl leading-tight text-gray-900">
                  {message.message}
                </p>

                {message.track?.spotify_embed_link && (
                  <div className="mt-6">
                    <iframe
                      src={message.track.spotify_embed_link}
                      width="100%"
                      height="152"
                      allow="encrypted-media"
                      className="rounded-lg shadow-sm"
                      title="Spotify Embed"
                    />
                  </div>
                )}
              </div>

              <div className="text-sm text-gray-500 text-right">
                Dikirim pada: {formattedDate} WIB
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}