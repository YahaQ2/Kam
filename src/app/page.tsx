"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/ui/footer";
import { InitialAnimation } from "@/components/initial-animation";
import { Navbar } from "@/components/ui/navbar";
import Link from "next/link";
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { CarouselCard } from "@/components/carousel-card";
import { motion, AnimatePresence } from "framer-motion";
import { BackgroundVideo } from "@/components/background-video";

interface Track {
  title?: string;
  artist?: string;
  cover_img?: string;
}

interface Menfess {
  id: number;
  sender: string;
  recipient: string;
  message: string;
  spotify_id?: string;
  track?: Track;
  created_at: string;
}

interface MenfessResponse {
  status: boolean;
  data: Menfess[];
}

const VISIBLE_MESSAGES = 6;

const DynamicCarousel = dynamic(() => import("@/components/carousel").then((mod) => mod.Carousel), {
  ssr: false,
  loading: () => <div className="h-40 flex items-center justify-center text-gray-300">Memuat carousel...</div>
});

export default function HomePage() {
  const [recentlyAddedMessages, setRecentlyAddedMessages] = useState<Menfess[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [currentCard, setCurrentCard] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isNight, setIsNight] = useState(false);

  const shuffleArray = (array: Menfess[]) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const validateMenfess = (data: any): data is Menfess => {
    return (
      typeof data?.id === 'number' &&
      typeof data?.sender === 'string' &&
      typeof data?.recipient === 'string' &&
      typeof data?.message === 'string'
    );
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

  const getTimeStatus = () => {
    const currentHour = new Date().getHours();
    const night = currentHour >= 18 || currentHour < 7;
    setIsNight(night);
    return {
      isNight: night,
      isMorning: !night
    };
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const fetchMessages = async () => {
      try {
        const response = await fetch(
          `https://unand.vercel.app/v1/api/menfess-spotify-search`,
          { signal: controller.signal }
        );
        
        if (!response.ok) throw new Error("Gagal memuat pesan");
        
        const data: MenfessResponse = await response.json();
        
        if (data?.status && Array.isArray(data.data)) {
          const validMessages = data.data.filter(validateMenfess);
          const shuffled = shuffleArray(validMessages).slice(0, VISIBLE_MESSAGES * 2);
          setRecentlyAddedMessages(shuffled);
        } else {
          throw new Error("Format data tidak valid");
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          setError(err instanceof Error ? err.message : "Terjadi kesalahan");
          console.error('Fetch error:', err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setRecentlyAddedMessages(prev => {
        if (prev.length < 2) return prev;
        const newArray = [...prev];
        const randomIndex = Math.floor(Math.random() * (newArray.length - 1)) + 1;
        [newArray[0], newArray[randomIndex]] = [newArray[randomIndex], newArray[0]];
        return newArray;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleScroll = () => {
    if (containerRef.current) {
      const scrollPosition = containerRef.current.scrollLeft;
      const cardWidth = containerRef.current.offsetWidth;
      setCurrentCard(Math.round(scrollPosition / cardWidth));
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.8, rotate: -5 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      rotate: 0,
      transition: { type: 'spring', stiffness: 120 } 
    },
    exit: { opacity: 0, scale: 0.8, rotate: 5 }
  };

  const renderTimeIcon = () => {
    const { isNight } = getTimeStatus();
    
    return (
      <motion.div 
        key={isNight ? 'moon' : 'sparkles'}
        initial={{ scale: 0 }}
        animate={{ rotate: isNight ? [0, 10, -10, 0] : 0, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {isNight ? (
          <motion.span
            className="text-4xl"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🌙
          </motion.span>
        ) : (
          <motion.div
            animate={{ rotate: [0, 20, -20, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="h-16 w-16 text-yellow-400 mx-auto" />
          </motion.div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-800">
      <InitialAnimation />
      <Navbar />
      
      <main className="flex-grow">
        <section className="relative overflow-hidden pt-24 pb-16 md:py-32 min-h-[600px]">
          {/* Background Video Section */}
          <div className="absolute inset-0 z-0">
            <BackgroundVideo />
            <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-transparent to-transparent backdrop-blur-[2px]" />
            <div className="absolute inset-0 bg-gradient-to-t from-white/60 via-transparent to-transparent backdrop-blur-[2px]" />
          </div>

          <div className="container mx-auto px-4 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="mb-8">
                {renderTimeIcon()}
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Menfess warga Unand
              </h1>
              <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-12">
                Sampaikan perasaanmu dengan cara yang berkesan 
              </p>
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
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              
            </motion.div>
            </div>
          <div className="relative w-full max-w-7xl mx-auto overflow-hidden mb-16">
            <DynamicCarousel />
          </div>
          </div>
        </section>
.
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                MENFESS TERBARU
              </h2>
              <p className="text-gray-600 max-w-xl mx-auto">
                Trending menfess
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
                  className={`flex ${
                    isMobile 
                      ? 'overflow-x-auto snap-x snap-mandatory scrollbar-hide px-4' 
                      : 'overflow-hidden justify-center'
                  }`}
                  onScroll={handleScroll}
                >
                  <AnimatePresence initial={false}>
                    {recentlyAddedMessages.slice(0, VISIBLE_MESSAGES).map((msg) => (
                      <motion.div
                        key={msg.id}
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        transition={{ duration: 0.3 }}
                        className={`${
                          isMobile 
                            ? 'flex-shrink-0 w-full snap-center p-4' 
                            : 'flex-shrink-0 w-full md:w-[400px] transition-transform duration-300'
                        }`}
                      >
                        <Link href={`/message/${msg.id}`} className="block h-full w-full p-4">
                          <div className="h-full w-full bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                            <div className="px-4 pt-4">
                              <div className="flex justify-between text-sm mb-2">
                                <div className="text-gray-300">
                                  <span className="font-semibold">From:</span> {msg.sender}
                                </div>
                                <div className="text-gray-300">
                                  <span className="font-semibold">To:</span> {msg.recipient}
                                </div>
                              </div>
                            </div>
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
                            <div className="p-4 bg-gray-700 rounded-b-2xl relative">
                              <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-24 h-0.5 bg-gray-500 rounded-full" />
                              <p className="text-sm text-white text-center mt-2">
                                {getFormattedDate(msg.created_at)}
                              </p>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {isMobile && (
                  <div className="flex justify-center space-x-2 mt-4">
                    {recentlyAddedMessages.slice(0, VISIBLE_MESSAGES).map((_, index) => (
                      <motion.div
                        key={index}
                        className={` h-2 w-2 rounded-full ${
                          currentCard === index ? 'bg-gray-300' : 'bg-gray-600'
                        }`}
                        animate={{ scale: currentCard === index ? 1.2 : 1 }}
                        transition={{ duration: 0.2 }}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}