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
import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  FacebookIcon,
  TwitterIcon,
  WhatsappIcon,
} from "react-share";

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

const SpotifyEmbed = ({ trackId }: { trackId?: string }) => {
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
  const params = useParams();
  const id = params?.id as string;
  const [message, setMessage] = useState<MessageType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMessage = async () => {
      setIsLoading(true);
      setError(null);
      
      if (!id) {
        setError("Invalid message ID");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `https://unand.vercel.app/v1/api/menfess-spotify-search/${id}`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status}`);
        }

        const data = await response.json();

        if (!data?.status || !data?.data?.[0]) {
          throw new Error("Invalid data format from server");
        }

        const messageData = data.data[0] as MessageType;
        setMessage(messageData);
      } catch (err) {
        console.error("Error fetching message:", err);
        setError(
          err instanceof Error 
            ? err.message 
            : "Failed to fetch message"
        );
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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl font-semibold text-red-600">{error}</p>
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

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = `Check out this message: ${message.message}`;

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Shared Message",
          text: shareText,
          url: shareUrl,
        });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        alert("Link copied to clipboard!");
      } else {
        throw new Error("Sharing not supported");
      }
    } catch (err) {
      console.error("Sharing failed:", err);
      alert("Failed to share message");
    }
  };

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
            <div className="mt-6 flex justify-center space-x-4">
              <FacebookShareButton url={shareUrl} quote={shareText}>
                <FacebookIcon size={32} round />
              </FacebookShareButton>
              <TwitterShareButton url={shareUrl} title={shareText}>
                <TwitterIcon size={32} round />
              </TwitterShareButton>
              <WhatsappShareButton url={shareUrl} title={shareText}>
                <WhatsappIcon size={32} round />
              </WhatsappShareButton>
              <Button 
                onClick={handleShare} 
                className="bg-gray-800 text-white hover:bg-gray-900"
              >
                Share
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}