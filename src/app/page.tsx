"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/ui/footer";
import { InitialAnimation } from "@/components/initial-animation";
import { Navbar } from "@/components/ui/navbar";
import Link from "next/link";
import { ArrowUpRight, ChevronLeft, ChevronRight, Sparkles, Heart, MessageCircle } from 'lucide-react';
import { CarouselCard } from "@/components/carousel-card";
import { motion, AnimatePresence, useMotionValue } from "framer-motion";

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
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const onDragEnd = () => {
    const x = dragX.get();
    
    if (x <= -SWIPE_THRESHOLD) {
      handleNext();
    } else if (x >= SWIPE_THRESHOLD) {
      handlePrevious();
    }
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % VISIBLE_MESSAGES);
    resetAutoSlide();
  };

  const handlePrevious = () => {
    setCurrentIndex(prev => (prev - 1 + VISIBLE_MESSAGES) % VISIBLE_MESSAGES);
    resetAutoSlide();
  };

  const resetAutoSlide = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % VISIBLE_MESSAGES);
    }, 5000);
  };

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`https://unand.vercel.app/v1/api/menfess-spotify-search`);
        if (!response.ok) throw new Error("Gagal memuat pesan");
        
        const responseData: MenfessResponse = await response.json();
        
        if (responseData.status && Array.isArray(responseData.data)) {
          const randomMessages = shuffleArray(responseData.data).slice(0, VISIBLE_MESSAGES);
          setRecentlyAddedMessages(randomMessages);
        } else {
          throw new Error("Format data tidak valid");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      } finally {
        setLoading(false);
      }
    };
  
    fetchMessages();
  }, []);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % VISIBLE_MESSAGES);
    }, 5000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-indigo-50 text-gray-800">
      <InitialAnimation />
      <Navbar />
      
      <main className="flex-grow">
        {/* ... Bagian Header tetap sama ... */}

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
            ) : (
              <div className="relative overflow-hidden group">
                <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white via-white/80 to-transparent z-10" />
                <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white via-white/80 to-transparent z-10" />

                {!loading && !error && recentlyAddedMessages.length === 0 && (
                  <div className="text-center py-12 bg-blue-50 rounded-xl">
                    <p className="text-blue-600">Belum ada menfess terbaru</p>
                  </div>
                )}

                <motion.div
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  onDragEnd={onDragEnd}
                  style={{ x: dragX }}
                  className="flex cursor-grab active:cursor-grabbing relative min-h-[500px] h-[600px] w-full"
                  ref={containerRef}
                >
                  <AnimatePresence mode="wait">
                    {recentlyAddedMessages.map((msg, index) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, scale: 0.9, x: `${(index - currentIndex) * 100}%` }}
                        animate={{
                          opacity: index === currentIndex ? 1 : 0.2,
                          scale: index === currentIndex ? 1 : 0.85,
                          x: `${(index - currentIndex) * 100}%`,
                        }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ type: "spring", stiffness: 150, damping: 25 }}
                        className="absolute w-full max-w-[95%] md:max-w-[80%] lg:max-w-[700px] left-1/2 -translate-x-1/2 px-4"
                      >
                        <div className="h-full w-full flex items-center justify-center">
                          <Link 
                            href={`/message/${msg.id}`} 
                            className="w-full h-full max-w-[500px] mx-auto"
                          >
                            <div className="h-full bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 overflow-hidden">
                              <CarouselCard 
                                to={msg.recipient} 
                                from={msg.sender} 
                                message={msg.message}
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
                              <div className="p-4 bg-gray-50 border-t">
                                <p className="text-sm text-gray-500">
                                  {new Date(msg.created_at).toLocaleDateString('id-ID', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </p>
                              </div>
                            </div>
                          </Link>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>

                <div className="flex items-center justify-center gap-4 mt-8">
                  <button
                    onClick={handlePrevious}
                    className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow"
                    disabled={currentIndex === 0}
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
                    disabled={currentIndex === recentlyAddedMessages.length - 1}
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