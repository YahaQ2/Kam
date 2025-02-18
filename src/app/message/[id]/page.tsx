"use client";

import { Helmet } from 'react-helmet-async';
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { Loader2, Twitter, Facebook, Link2, MessageCircle, Instagram } from "lucide-react";

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

const ShareButton = ({ 
  platform, 
  onClick, 
  icon: Icon, 
  label 
}: {
  platform: string;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
}) => (
  <Button
    onClick={onClick}
    className={`${
      platform === 'whatsapp' ? 'bg-green-600 hover:bg-green-700' :
      platform === 'facebook' ? 'bg-blue-600 hover:bg-blue-700' :
      platform === 'twitter' ? 'bg-blue-400 hover:bg-blue-500' :
      platform === 'instagram' ? 'bg-pink-600 hover:bg-pink-700' :
      'bg-gray-800 hover:bg-gray-900'
    } flex items-center`}
  >
    <Icon className="w-4 h-4 mr-2" />
    {label}
  </Button>
);

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

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        if (!data?.status || !data?.data?.[0]) throw new Error("Invalid data format");

        setMessage(data.data[0]);
      } catch (error) {
        console.error("Error fetching message:", error);
        setMessage(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessage();
  }, [id]);

  const handleShare = (platform: string) => {
    const shareUrl = `https://unand.vercel.app/message/${id}`;
    const shareText = `Check out this message I received: ${message?.message}`;
    const imageUrl = `https://unand.vercel.app/api/og-image/${id}`;

    const shareConfig: Record<string, { url: string; text?: string }> = {
      twitter: {
        url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      },
      facebook: {
        url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      },
      whatsapp: {
        url: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`,
      },
      instagram: {
        url: imageUrl,
      },
      copy: {
        url: shareUrl,
      },
    };

    const config = shareConfig[platform];
    if (!config) return;

    if (platform === 'copy') {
      navigator.clipboard.writeText(config.url)
        .then(() => alert('Link copied to clipboard!'))
        .catch(() => alert('Failed to copy link'));
      return;
    }

    window.open(config.url, '_blank', 'noopener,noreferrer');
  };

  const formattedDate = message?.created_at 
    ? dayjs.utc(message.created_at).tz("Asia/Jakarta").format("DD MMM YYYY, HH:mm")
    : '';

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

  return (
    <div className="min-h-screen bg-white text-gray-800 flex flex-col">
      <Helmet>
        <title>Message for {message.recipient}</title>
        <meta property="og:title" content={`Message for ${message.recipient}`} />
        <meta property="og:description" content={message.message} />
        <meta property="og:image" content={`https://unand.vercel.app/api/og-image/${id}`} />
        <meta property="og:url" content={`https://unand.vercel.app/message/${id}`} />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-32">
        <Button
          onClick={() => router.back()}
          className="mb-8 bg-gray-800 text-white hover:bg-gray-900"
        >
          Back
        </Button>
        
        <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="mb-6">
              <p className="text-sm text-gray-500">To: {message.recipient}</p>
              <p className="text-sm text-gray-500">From: {message.sender}</p>
            </div>

            <div className="border-t border-b border-gray-200 py-6 space-y-6">
              <p className="text-sm text-gray-500 italic">
                Seseorang mengirimkan lagu dan pesan untukmu, mungkin ini adalah
                lagu yang akan kamu sukai :)
              </p>
              
              <p className="font-['Reenie_Beanie'] leading-relaxed text-3xl md:text-4xl">
                {message.message}
              </p>

              {message.gif_url && !imageError && (
                <div className="w-[200px] h-[200px] md:w-[240px] md:h-[240px] mx-auto relative">
                  <Image
                    src={message.gif_url}
                    alt="Gift from sender"
                    fill
                    className="rounded-lg object-cover"
                    onError={() => setImageError(true)}
                    unoptimized
                    sizes="(max-width: 768px) 200px, 240px"
                  />
                </div>
              )}

              {message.spotify_id && <SpotifyEmbed trackId={message.spotify_id} />}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <ShareButton
                platform="whatsapp"
                onClick={() => handleShare('whatsapp')}
                icon={MessageCircle}
                label="WhatsApp"
              />
              <ShareButton
                platform="facebook"
                onClick={() => handleShare('facebook')}
                icon={Facebook}
                label="Facebook"
              />
              <ShareButton
                platform="twitter"
                onClick={() => handleShare('twitter')}
                icon={Twitter}
                label="Twitter"
              />
              <ShareButton
                platform="instagram"
                onClick={() => handleShare('instagram')}
                icon={Instagram}
                label="Instagram"
              />
              <Button
                onClick={() => handleShare('copy')}
                variant="outline"
                className="flex items-center"
              >
                <Link2 className="w-4 h-4 mr-2" />
                Copy Link
              </Button>
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