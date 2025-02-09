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
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-100 to-gray-900">
      <InitialAnimation />
      {/* Perubahan pada navbar - text hitam */}
      <div className="text-gray-900">
        <Navbar />
      </div>
      
      <main className="flex-grow">
        <section className="relative overflow-hidden pt-24 pb-16 md:py-32">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="mb-8">
                <Sparkles className="h-16 w-16 text-gray-400 mx-auto animate-pulse" />
              </div>
              {/* Perubahan pada judul - text hitam */}
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 [text-shadow:_0_2px_4px_rgb(0_0_0_/_40%)]">
                Menfess warga Unand
              </h1>
              <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-12">
                Sampaikan perasaanmu dengan cara yang berkesan 
              </p>
              <div className="flex flex-col items-center gap-4 mb-8">
                <Link
                  href="https://forms.zohopublic.com/notnoting12gm1/form/Saran/formperma/8hcRs5pwX77B9AprPeIsvWElcwC1s3JJZlReOgJ3vdc"
                  className="inline-flex items-center justify-center px-4 py-2 text-sm md:text-base font-medium text-gray-600 hover:text-gray-900 transition-colors border border-gray-400 rounded-full hover:border-gray-600"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>Kirim Saran/Masukan</span>
                  <ArrowUpRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row justify-center gap-6 mb-16"
            >
              <Button
                asChild
                className="group relative overflow-hidden bg-gradient-to-r from-gray-600 to-gray-800 text-white px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Link href="/message">
                  <span className="relative z-10 flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Kirim Menfess
                  </span>
                </Link>
              </Button>

              <Button
                asChild
                className="group relative overflow-hidden bg-gray-800 border-2 border-gray-600 text-gray-300 px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Link href="/search-message">
                  <span className="relative z-10 flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Explore Menfess
                  </span>
                </Link>
              </Button>

              <Button
                asChild
                className="group relative overflow-hidden bg-gray-800 border-2 border-gray-600 text-gray-300 px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Link href="https://ziwa-351410.web.app">
                  <span className="relative z-10 flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Ziwa - Cari Teman baru & fun space
                  </span>
                </Link>
              </Button>
            </motion.div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-100 to-gray-300 bg-clip-text text-transparent mb-4 [text-shadow:_0_2px_4px_rgb(0_0_0_/_40%)]">
                MENFESS TERBARU
              </h2>
              <p className="text-gray-400 max-w-xl mx-auto">
                Trending menfess
              </p>
            </div>

            {loading ? (
              <div className="h-96 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-500 border-t-transparent" />
              </div>
            ) : error ? (
              <div className="text-center py-12 bg-gray-800 rounded-xl">
                <p className="text-gray-300 flex items-center justify-center gap-2">
                  <span className="text-xl">⚠️</span>
                  {error}
                </p>
              </div>
            ) : recentlyAddedMessages.length === 0 ? (
              <div className="text-center py-12 bg-gray-800 rounded-xl">
                <p className="text-gray-300">Belum ada menfess terbaru</p>
              </div>
            ) : (
              <div className="relative overflow-hidden group">
                <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-gray-900 via-gray-900/80 to-transparent z-10" />
                <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-gray-900 via-gray-900/80 to-transparent z-10" />

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
                          <div className="h-full w-full bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                            <CarouselCard
                              to={msg.rec ipient || '-'}
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
                            <div className="p-4 bg-gray-700 rounded-b-2xl relative">
                              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-0.5 bg-gray-500 rounded-full" />
                              <p className="text-sm text-gray-300 text-center mt-2">
                                {getFormattedDate(msg.created_at)}
                              </p>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>

                <div className="flex items-center justify-center gap-4 mt-8">
                  <button
                    onClick={handlePrevious}
                    className="p-2 rounded-full bg-gray-800 shadow-md hover:shadow-lg transition-shadow"
                  >
                    <ChevronLeft className="h-6 w-6 text-gray-300" />
                  </button>
                  
                  <div className="flex gap-2">
                    {recentlyAddedMessages.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`h-3 w-3 rounded-full transition-colors ${
                          idx === currentIndex ? 'bg-gray-300' : 'bg-gray-600'
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={handleNext}
                    className="p-2 rounded-full bg-gray-800 shadow-md hover:shadow-lg transition-shadow"
                  >
                    <ChevronRight className="h-6 w-6 text-gray-300" />
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