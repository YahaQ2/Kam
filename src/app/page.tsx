"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/ui/footer";
import { InitialAnimation } from "@/components/initial-animation";
import { Navbar } from "@/components/ui/navbar";
import Link from "next/link";
import { ArrowUpRight, ChevronLeft, ChevronRight, Sparkles, Heart, MessageCircle } from 'lucide-react';
import { CarouselCard } from "@/components/carousel-card";
import { motion, useMotionValue } from "framer-motion";

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
  };
  created_at: string;
}

interface MenfessResponse {
  status: boolean;
  success: boolean;
  message: string | null;
  data: Menfess[];
}

const SWIPE_THRESHOLD = 100;
const VISIBLE_MESSAGES = 6;

export default function HomePage() {
  const [recentlyAddedMessages, setRecentlyAddedMessages] = useState<Menfess[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const dragX = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout>();

  const shuffleArray = (array: Menfess[]) => {
    return [...array].sort(() => Math.random() - 0.5);
  };

  const validateMenfess = (data: any): data is Menfess => {
    return (
      typeof data?.id === 'number' &&
      typeof data?.sender === 'string' &&
      typeof data?.recipient === 'string' &&
      typeof data?.message === 'string'
    );
  };

  const onDragEnd = () => {
    const x = dragX.get();
    if (x <= -SWIPE_THRESHOLD) handleNext();
    else if (x >= SWIPE_THRESHOLD) handlePrevious();
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % recentlyAddedMessages.length);
    resetAutoSlide();
  };

  const handlePrevious = () => {
    setCurrentIndex(prev => (prev - 1 + recentlyAddedMessages.length) % recentlyAddedMessages.length);
    resetAutoSlide();
  };

  const resetAutoSlide = () => {
    clearInterval(intervalRef.current!);
    intervalRef.current = setInterval(handleNext, 5000);
  };

  const getFormattedDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Tanggal tidak valid';
    }
  };

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`https://unand.vercel.app/v1/api/menfess-spotify-search`);
        if (!response.ok) throw new Error("Gagal memuat pesan");
        
        const data: MenfessResponse = await response.json();
        
        if (data?.status && Array.isArray(data.data)) {
          const validMessages = data.data.filter(validateMenfess);
          const shuffled = shuffleArray(validMessages).slice(0, VISIBLE_MESSAGES);
          setRecentlyAddedMessages(shuffled);
        } else {
          throw new Error("Format data tidak valid");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan");
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  useEffect(() => {
    if (recentlyAddedMessages.length > 0) {
      resetAutoSlide();
    }
    return () => clearInterval(intervalRef.current!);
  }, [recentlyAddedMessages]);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-indigo-50 text-gray-800">
      <InitialAnimation />
      <Navbar />
      
      <main className="flex-grow">
        {/* ... (Bagian header tetap sama) ... */}

        <section className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
                MENFESS TERBARU
              </h2>
              <p className="text-gray-600 max-w-xl mx-auto">
                Trending menfess
              </p>
            </div>

            {loading ? (
              <div className="h-96 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent" />
              </div>
            ) : error ? (
              <div className="text-center py-12 bg-red-50 rounded-xl">
                <p className="text-red-600 flex items-center justify-center gap-2">
                  <span className="text-xl">⚠️</span>
                  {error}
                </p>
              </div>
            ) : recentlyAddedMessages.length === 0 ? (
              <div className="text-center py-12 bg-blue-50 rounded-xl">
                <p className="text-blue-600">Belum ada menfess terbaru</p>
              </div>
            ) : (
              <div className="relative overflow-hidden group">
                <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white via-white/80 to-transparent z-10" />
                <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white via-white/80 to-transparent z-10" />

                <div className="relative h-[600px] w-full max-w-4xl mx-auto">
                  <motion.div
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    onDragEnd={onDragEnd}
                    style={{ 
                      x: dragX,
                      translateX: `-${currentIndex * 100}%`
                    }}
                    className="flex cursor-grab active:cursor-grabbing h-full"
                    ref={containerRef}
                  >
                    {recentlyAddedMessages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        className="w-full h-full flex-shrink-0 px-4"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ 
                          opacity: 1,
                          scale: 1,
                          transition: { 
                            type: "spring", 
                            stiffness: 300, 
                            damping: 30 
                          }
                        }}
                      >
                        <Link
                          href={`/message/${msg.id}`}
                          className="block h-full w-full p-4"
                          onClick={(e) => {
                            if (Math.abs(dragX.get()) > 10) e.preventDefault();
                          }}
                        >
                          <div className="h-full w-full bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                            <CarouselCard
                              to={msg.recipient || '-'}
                              from={msg.sender || '-'}
                              message={msg.message || 'Pesan tidak tersedia'}
                              songTitle={msg.track?.title}
                              artist={msg.track?.artist}
                              coverUrl={msg.track?.cover_img}
                              spotifyEmbed={
                                msg.spotify_id && (
                                  <div className="px-4 pb-4">
                                    <iframe
                                      className="w-full rounded-lg shadow-md"
                                      src={`https://open.spotify.com/embed/track/${msg.spotify_id}`}
                                      width="100%"
                                      height="80"
                                      frameBorder="0"
                                      allow="encrypted-media"
                                    />
                                  </div>
                                )
                              }
                            />
                            <div className="p-4 bg-gray-50 border-t rounded-b-2xl">
                              <p className="text-sm text-gray-500 text-center">
                                {getFormattedDate(msg.created_at)}
                              </p>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>

                {/* Navigation controls */}
                <div className="flex items-center justify-center gap-4 mt-8">
                  <button
                    onClick={handlePrevious}
                    className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow"
                  >
                    <ChevronLeft className="h-6 w-6 text-indigo-600" />
                  </button>
                  
                  <div className="flex gap-2">
                    {recentlyAddedMessages.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`h-3 w-3 rounded-full transition-colors ${
                          idx === currentIndex ? 'bg-indigo-600' : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={handleNext}
                    className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow"
                  >
                    <ChevronRight className="h-6 w-6 text-indigo-600" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}