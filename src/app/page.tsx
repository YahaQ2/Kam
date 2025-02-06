"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/ui/footer";
import { InitialAnimation } from "@/components/initial-animation";
import { Navbar } from "@/components/ui/navbar";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowUpRight } from 'lucide-react';
import { motion } from "framer-motion";

interface Menfess {
  id: number;
  sender: string;
  recipient: string;
  message: string;
  spotify_id?: string;
  track?: {
    title: string;
    artist: string;
    cover_img: string;
    preview_link: string | null;
    spotify_embed_link: string;
    external_link: string;
  };
  created_at: string;
}

const DynamicCarousel = dynamic(() => import("@/components/carousel").then((mod) => mod.Carousel), {
  ssr: false,
});

export default function HomePage() {
  const [recentlyAddedMessages, setRecentlyAddedMessages] = useState<Menfess[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`https://unand.vercel.app/v1/api/menfess-spotify-search`);
        if (!response.ok) throw new Error("Failed to fetch messages.");
        
        const responseData = await response.json();
        
        if (responseData.status && Array.isArray(responseData.data)) {
          const messagesWithTracks = await Promise.all(responseData.data.map(async (menfess) => {
            if (menfess.spotify_id) {
              const trackResponse = await fetch(`https://api.spotify.com/v1/tracks/${menfess.spotify_id}`, {
                headers: {
                  'Authorization': 'Bearer YOUR_SPOTIFY_ACCESS_TOKEN'
                }
              });
              if (trackResponse.ok) {
                const trackData = await trackResponse.json();
                menfess.track = {
                  title: trackData.name,
                  artist: trackData.artists.map((artist: any) => artist.name).join(', '),
                  cover_img: trackData.album.images[0].url,
                  preview_link: trackData.preview_url,
                  spotify_embed_link: `https://open.spotify.com/embed/track/${menfess.spotify_id}`,
                  external_link: trackData.external_urls.spotify
                };
              }
            }
            return menfess;
          }));

          const sortedMessages = messagesWithTracks
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 5);
          
          setRecentlyAddedMessages(sortedMessages);
        } else {
          throw new Error("Invalid data format.");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchMessages();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-800">
      <InitialAnimation />
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8 md:py-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 md:mb-6">Menfess Masyarakat Unand</h2>
          <Link
            href="https://www.instagram.com/@unandfess.xyz"
            className="inline-flex items-center justify-center px-4 py-2 mb-8 text-sm md:text-base font-medium text-gray-600 hover:text-gray-800 transition-colors border border-gray-300 rounded-full hover:border-gray-400"
          >
            <span>Saran/Masukan/Fitur Baru</span>
            <ArrowUpRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
          </Link>

          <div className="relative w-full max-w-7xl mx-auto overflow-hidden mb-16">
            <DynamicCarousel />
          </div>

          <div className="mt-16">
            <h3 className="text-2xl md:text-3xl font-bold mb-8">Menfess Terbaru</h3>
            {loading ? (
              <p>Loading...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : recentlyAddedMessages.length === 0 ? (
              <p>No recent messages found.</p>
            ) : (
              <motion.div 
                className="flex overflow-x-auto space-x-4 scrollbar-hide py-4"
                ref={containerRef}
                animate={{ x: ["0%", "-100%"] }}
                transition={{ ease: "linear", duration: 15, repeat: Infinity }}
              >
                {recentlyAddedMessages.map((msg) => (
                  <div key={msg.id} className="flex-shrink-0 w-72 bg-white shadow-md rounded-lg p-4 text-left">
                    {msg.track?.cover_img && (
                      <img 
                        src={msg.track.cover_img} 
                        alt={msg.track.title} 
                        className="w-full h-40 object-cover rounded-md mb-3"
                      />
                    )}
                    <h4 className="font-bold text-lg">{msg.track?.title || "Unknown Title"}</h4>
                    <p className="text-gray-600">{msg.track?.artist || "Unknown Artist"}</p>
                    <p className="text-gray-800 mt-2">"{msg.message}"</p>
                    <div className="mt-3">
                      {msg.track?.preview_link && (
                        <audio controls className="w-full">
                          <source src={msg.track.preview_link} type="audio/mpeg" />
                        </audio>
                      )}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}