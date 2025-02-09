"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/ui/footer";
import { InitialAnimation } from "@/components/initial-animation";
import { Navbar } from "@/components/ui/navbar";
import Link from "next/link";
import { ArrowUpRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
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

const CarouselCard = ({
  recipient,
  sender,
  message,
  songTitle,
  artist,
  coverUrl,
  spotifyEmbed,
}: {
  recipient: string;
  sender: string;
  message: string;
  songTitle?: string;
  artist?: string;
  coverUrl?: string;
  spotifyEmbed?: React.ReactNode;
}) => (
  <div className="bg-white p-6 rounded-xl shadow-lg h-full flex flex-col">
    <div className="mb-4">
      <h3 className="text-gray-500 text-sm mb-1">Untuk: {recipient}</h3>
      <h3 className="text-gray-500 text-sm">Dari: {sender}</h3>
    </div>

    <div className="bg-gray-50 p-4 rounded-lg mb-4 flex-grow">
      <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
        {message}
      </p>
    </div>

    {coverUrl && (
      <div className="flex items-center gap-4 mb-4">
        <img
          src={coverUrl}
          alt="Album cover"
          className="w-12 h-12 rounded-md object-cover"
        />
        <div>
          <p className="text-gray-900 font-medium text-sm">{songTitle}</p>
          <p className="text-gray-500 text-xs">{artist}</p>
        </div>
      </div>
    )}

    {spotifyEmbed}
  </div>
);

export default function HomePage() {
  const [recentlyAddedMessages, setRecentlyAddedMessages] = useState<Menfess[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [currentCard, setCurrentCard] = useState(0);
  const dragX = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout>();

  const shuffleArray = (array: Menfess[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
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
    setCurrentCard(prev => (prev + 1) % recentlyAddedMessages.length);
    resetAutoSlide();
  };

  const handlePrevious = () => {
    setCurrentCard(prev => (prev - 1 + recentlyAddedMessages.length) % recentlyAddedMessages.length);
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
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const isNightTime = () => {
    const currentHour = new Date().getHours();
    return currentHour >= 18;
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-800">
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
                {isNightTime() ? (
                  <span className="text-4xl">🌙</span>
                ) : (
                  <Sparkles className="h-16 w-16 text-yellow-400 mx-auto animate-pulse" />
                )}
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
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
                className="bg-gray-800 text-white px-6 md:px-8 py-2.5 md:py-3 rounded-full hover:bg-gray-900 transition-colors"
              >
                <Link href="/message">Kirim Menfess</Link>
              </Button>
              <Button
                asChild
                className="border-2 border-gray-800 bg-white text-gray-800 px-6 md:px-8 py-2.5 md:py-3 rounded-full hover:bg-gray-100 transition-colors"
              >
                <Link href="/search-message">Explore Menfess</Link>
              </Button>
              <Button
                asChild
                className="border-2 border-blue-600 bg-blue-50 text-blue-600 px-6 md:px-8 py-2.5 md:py-3 rounded-full hover:bg-blue-100 transition-colors"
              >
                <Link href="https://ziwa-351410.web.app">
                  Ziwa - Cari Teman baru & fun space
                </Link>
              </Button>
            </motion.div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                MENFESS TERBARU
              </h2>
              <p className="text-gray-600 max-w-xl mx-auto">
                Pesan-pesan yang baru saja dikirim
              </p>
            </div>

            {loading ? (
              <div className="h-40 flex items-center justify-center text-gray-300">Memuat...</div>
            ) : error ? (
              <p className="text-red-500 text-center">{error}</p>
            ) : recentlyAddedMessages.length === 0 ? (
              <p className="text-gray-300 text-center">Tidak ada pesan terbaru</p>
            ) : (
              <div className="relative">
                <div 
                  ref={containerRef}
                  className={`flex overflow-hidden justify-center`}
                >
                  <motion.div
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    onDragEnd={onDragEnd}
                    style={{ 
                      x: dragX,
                      translateX: `-${currentCard * 100}%`
                    }}
                    className="flex cursor-grab active:cursor-grabbing h-full"
                  >
                    <AnimatePresence initial={false}>
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
                          >
                            <div className="h-full w-full bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                              <CarouselCard
                                recipient={msg.recipient || '-'}
                                sender={msg.sender || '-'}
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
                            </div>
                          </Link>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>
                </div>

                <div className="flex items-center justify-center gap-4 mt-8">
                  <button
                    onClick={handlePrevious}
                    className="p-2 rounded-full bg-gray-200 shadow-md hover:shadow-lg transition-shadow"
                  >
                    <ChevronLeft className="h-6 w-6 text-gray-700" />
                  </button>
                  
                  <div className="flex gap-2">
                    {recentlyAddedMessages.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentCard(idx)}
                        className={`h-3 w-3 rounded-full transition-colors ${
                          idx === currentCard ? 'bg-gray-700' : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={handleNext}
                    className="p-2 rounded-full bg-gray-200 shadow-md hover:shadow-lg transition-shadow"
                  >
                    <ChevronRight className="h-6 w-6 text-gray-700" />
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