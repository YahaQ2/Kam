"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/ui/footer";
import { InitialAnimation } from "@/components/initial-animation";
import { Navbar } from "@/components/ui/navbar";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowUpRight } from 'lucide-react';
import { CarouselCard } from "@/components/carousel-card";
import { motion, AnimatePresence } from "framer-motion";

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

interface MenfessResponse {
  status: boolean;
  data: Menfess[];
}

const DynamicCarousel = dynamic(() => import("@/components/carousel").then((mod) => mod.Carousel), {
  ssr: false,
});

export default function HomePage() {
  const [messages, setMessages] = useState<Menfess[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<"left" | "right">("right");

  const fetchMessages = async () => {
    try {
      const res = await fetch("https://unand.vercel.app/v1/api/menfess-spotify-search");
      const data: MenfessResponse = await res.json();
      
      const messagesWithTracks = await Promise.all(data.data.map(async (msg) => {
        if (msg.spotify_id) {
          const trackRes = await fetch(`https://api.spotify.com/v1/tracks/${msg.spotify_id}`, {
            headers: {
              Authorization: `Bearer YOUR_SPOTIFY_TOKEN`
            }
          });
          const trackData = await trackRes.json();
          
          return {
            ...msg,
            track: {
              title: trackData.name,
              artist: trackData.artists[0].name,
              cover_img: trackData.album.images[0].url,
              preview_link: trackData.preview_url,
              spotify_embed_link: trackData.external_urls.spotify,
              external_link: trackData.external_urls.spotify
            }
          };
        }
        return msg;
      }));

      setMessages(messagesWithTracks
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5)
      );
    } catch (err) {
      setError("Gagal memuat pesan");
    } finally {
      setLoading(false);
    }
  };
  async function getProfile(accessToken) {
  let accessToken = localStorage.getItem('access_token');

  const response = await fetch('https://api.spotify.com/v1/me', {
    headers: {
      Authorization: 'Bearer ' + accessToken
    }
  });

  const data = await response.json();
}


  useEffect(() => {
    fetchMessages();
  }, []);

  const handleNext = () => {
    setDirection("right");
    setCurrentIndex(prev => (prev + 1) % messages.length);
  };

  const handlePrev = () => {
    setDirection("left");
    setCurrentIndex(prev => (prev - 1 + messages.length) % messages.length);
  };

  const cardVariants = {
    enter: (direction: string) => ({
      x: direction === "right" ? 300 : -300,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: string) => ({
      x: direction === "right" ? -300 : 300,
      opacity: 0
    })
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-800">
      <InitialAnimation />
      <Navbar />
      
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8 md:py-16 text-center">
          {/* Bagian header tetap sama */}
          
          {/* Bagian carousel terbaru */}
          <div className="mt-16">
            <h3 className="text-2xl md:text-3xl font-bold mb-8">Menfess Terbaru</h3>
            
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-8 h-8 border-4 border-gray-300 border-t-gray-800 rounded-full"
                />
              </div>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : messages.length === 0 ? (
              <p>Tidak ada pesan terbaru</p>
            ) : (
              <div className="relative h-96">
                <AnimatePresence initial={false} custom={direction}>
                  <motion.div
                    key={currentIndex}
                    custom={direction}
                    variants={cardVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ type: "tween", duration: 0.3 }}
                    className="absolute w-full max-w-2xl mx-auto"
                  >
                    <CarouselCard
                      to={messages[currentIndex].recipient}
                      from={messages[currentIndex].sender}
                      message={messages[currentIndex].message}
                      songTitle={messages[currentIndex].track?.title}
                      artist={messages[currentIndex].track?.artist}
                      coverUrl={messages[currentIndex].track?.cover_img}
                    />
                  </motion.div>
                </AnimatePresence>

                <div className="flex justify-center space-x-2 mt-4">
                  {messages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentIndex(idx)}
                      className={`w-3 h-3 rounded-full ${
                        currentIndex === idx ? "bg-gray-800" : "bg-gray-300"
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={handlePrev}
                  className="absolute left-0 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-full"
                >
                  ←
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-full"
                >
                  →
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}