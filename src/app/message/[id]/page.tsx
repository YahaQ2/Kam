"use client";

import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { useEffect, useState, useRef } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { Loader2 } from "lucide-react";
import { getTrackInfo } from "@/lib/spotify";

dayjs.extend(utc);
dayjs.extend(timezone);

declare global {
  interface Window {
    onSpotifyIframeApiReady: (IFrameAPI: any) => void;
  }
}

type MessageType = {
  id: number;
  sender: string;
  recipient: string;
  message: string;
  gif_url: string;
  track?: {
    spotify_embed_link?: string;
  };
  created_at: string;
};

// Fungsi untuk mengekstrak track ID dengan error handling
function extractTrackId(embedLink?: string) {
  if (!embedLink) return null;
  const match = embedLink.match(/track\/([a-zA-Z0-9]+)/);
  return match ? match[1] : null;
}

const SpotifyEmbed = ({ trackId }: { trackId?: string | null }) => {
  const embedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!trackId) return;

    const script = document.createElement("script");
    script.src = "https://open.spotify.com/embed/iframe-api/v1";
    script.async = true;
    
    const existingScript = document.querySelector('script[src="https://open.spotify.com/embed/iframe-api/v1"]');
    if (existingScript) return;

    document.body.appendChild(script);

    script.onload = () => {
      window.onSpotifyIframeApiReady = (IFrameAPI) => {
        if (embedRef.current) {
          IFrameAPI.createController(embedRef.current, {
            uri: `spotify:track:${trackId}`,
            width: "100%",
            height: "180",
          });
        }
      };
    };

    return () => {
      document.body.removeChild(script);
      delete window.onSpotifyIframeApiReady;
    };
  }, [trackId]);

  if (!trackId) return null;

  return <div ref={embedRef} className="rounded-lg mt-6" />;
};

export default function MessagePage() {
  const router = useRouter();
  const { id } = useParams();
  const [message, setMessage] = useState<MessageType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [trackInfo, setTrackInfo] = useState<SpotifyApi.TrackObjectFull | null>(null);

  useEffect(() => {
    const fetchMessage = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`https://unand.vercel.app/v1/api/menfess-spotify-search/${id}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data?.status && data?.data?.[0]) {
          const messageData = data.data[0];
          setMessage(messageData);

          // Handle Spotify track
          if (messageData.track?.spotify_embed_link) {
            try {
              const trackId = extractTrackId(messageData.track.spotify_embed_link);
              if (trackId) {
                const trackData = await getTrackInfo(trackId);
                if (trackData) setTrackInfo(trackData);
              }
            } catch (error) {
              console.error("Error fetching track info:", error);
            }
          }
        }
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

  const formattedDate = dayjs.utc(message.created_at).tz("Asia/Jakarta").format("DD MMM YYYY, HH:mm");

  return (
    <div className="min-h-screen bg-white text-gray-800 flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-32">
        <Button onClick={() => router.back()} className="mb-8 bg-gray-800 text-white hover:bg-gray-900">
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
                Seseorang mengirimkan lagu dan pesan untukmu, mungkin ini adalah lagu yang akan kamu sukai :)
              </p>
              <p className="font-['Reenie_Beanie'] leading-relaxed text-4xl">{message.message}</p>
              {message.gif_url && (
                <img
                  src={message.gif_url}
                  alt="Gift from sender"
                  className="mx-auto my-4 max-w-full h-auto rounded-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder.svg";
                  }}
                />
              )}
              {message.track?.spotify_embed_link && (
                <SpotifyEmbed trackId={extractTrackId(message.track.spotify_embed_link)} />
              )}
              {trackInfo && (
                <div className="mt-4">
                  <h2 className="text-xl font-semibold">{trackInfo.name}</h2>
                  <p className="text-gray-500">
                    {trackInfo.artists?.map(artist => artist.name).join(', ')}
                  </p>
                  <p className="text-gray-500">{trackInfo.album?.name}</p>
                </div>
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