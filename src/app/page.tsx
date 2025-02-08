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

export default function HomePage() {
  const [recentlyAddedMessages, setRecentlyAddedMessages] = useState<Menfess[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const dragX = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const onDragEnd = () => {
    const x = dragX.get();
    
    if (x <= -SWIPE_THRESHOLD) {
      setCurrentIndex(prev => Math.min(recentlyAddedMessages.length - 1, prev + 1));
    } else if (x >= SWIPE_THRESHOLD) {
      setCurrentIndex(prev => Math.max(0, prev - 1));
    }
  };

  const shuffleArray = (array: Menfess[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math. random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`https://unand.vercel.app/v1/api/menfess-spotify-search`);
        if (!response.ok) throw new Error("Gagal memuat pesan");
        
        const responseData: MenfessResponse = await response.json();
        
        if (responseData.status && Array.isArray(responseData.data)) {
          const sortedMessages = responseData.data
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          
          setRecentlyAddedMessages(shuffleArray(sortedMessages));
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
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % recentlyAddedMessages.length);
    }, 9000); // Change slide every 5 seconds

    return () => clearInterval(interval); // Clear interval on unmount
  }, [recentlyAddedMessages.length]);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-indigo-50 text-gray-800">
      <InitialAnimation />
      <Navbar />
      
      <main className="flex-grow">
        <section className="relative overflow-hidden pt-24 pb-16 md:py-32">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="mb-8">
                <Sparkles className="h-16 w-16 text-amber-400 mx-auto animate-pulse" />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">
                Menfess warga Unand
              </h1>
              <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-12">
                Sampaikan perasaanmu dengan cara yang berkesan 
              </p>
              <div className="flex flex-col items-center gap-4 mb-8">
                <Link
                  href="https://forms.zohopublic.com/notnoting12gm1/form/Saran/formperma/8hcRs5pwX77B9AprPeIsvWElcwC1s3JJZlReOgJ3vdc"
                  className="inline-flex items-center justify-center px-4 py-2 text-sm md:text-base font-medium text-gray-600 hover:text-gray-800 transition-colors border border-gray-300 rounded-full hover:border-gray-400"
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
                className="group relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Link href="/message">
                  <span className="relative z-10 flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Kirim Menfess
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Link>
              </Button>

              <Button
                asChild
                className="group relative overflow-hidden bg-white border-2 border-indigo-600 text-indigo-600 px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Link href="/search-message">
                  <span className="relative z-10 flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Explore Menfess
                  </span>
                  <div className="absolute inset-0 bg-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Link>
              </Button>

              <Button
                asChild
                className="group relative overflow-hidden bg-white border-2 border-indigo-600 text-indigo-600 px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Link href="https://ziwa-351410.web.app">
                  <span className="relative z-10 flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Ziwa - Cari Teman baru & fun space
                  </span>
                  <div className="absolute inset-0 bg-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
                Menfess Terbaru
              </h2>
              <p className="text-gray-600 max-w-xl mx-auto">
                Pesan-pesan terbaru yang penuh makna
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

                <motion.div
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  onDragEnd={onDragEnd}
                  style={{ x: dragX }}
                  className="flex cursor-grab active:cursor-grabbing"
                  ref={containerRef}
                >
                  <AnimatePresence mode="wait">
                    {recentlyAddedMessages.map((msg, index) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ 
                          opacity: index === currentIndex ? 1 : 0,
                          scale: index === currentIndex ? 1 : 0.9,
                          x: `calc(${index * 100}% - ${currentIndex * 100}%)`
                        }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="w-full flex-shrink-0 px-4"
                      >
                        <Link href={`/message/${msg.id}`}>
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
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>

                <div className="flex items-center justify-center gap-4 mt-8">
                  <button
                    onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
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
                    onClick={() => setCurrentIndex(prev => Math.min(recentlyAddedMessages.length - 1, prev + 1))}
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