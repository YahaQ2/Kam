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
import dynamic from "next/dynamic";
import Image from "next/image";

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
const MESSAGES = [
  "semangat untuk hari ini kamu selalu luar biasa",
  "kamu harus jaga kesehatan mu,tidurnya di jaga ya! 😊",
  "Sudahkah kamu menyapa temanmu hari ini? 👋",
  "Cinta itu indah, tapi jangan lupa kuliah! 📚",
  "Tetap semangat dan jaga kesehatan! 💪",
  "Jangan lupa minum air putih hari ini! 💧",
  "Ingat ya, kamu itu spesial dan unik! ✨",
  "Hari ini adalah kesempatan baru untuk memulai hal baru"
];

interface FlyingObject {
  id: number;
  type: 'bird' | 'plane';
  message: string;
  direction: 'left' | 'right';
  top: number;
  duration: number;
}

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
  const [flyingObjects, setFlyingObjects] = useState<FlyingObject[]>([]);
  const nextTypeRef = useRef<'bird' | 'plane'>('bird');
  const messageIndexRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fungsi untuk shuffle array
  const shuffleArray = (array: Menfess[]) => {
    if (!array.length) return [];
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray.slice(0, VISIBLE_MESSAGES * 2);
  };

  // Validasi data menfess
  const validateMenfess = (data: any): data is Menfess => {
    return (
      typeof data?.id === 'number' &&
      typeof data?.sender === 'string' &&
      typeof data?.recipient === 'string' &&
      typeof data?.message === 'string'
    );
  };

  // Format tanggal
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

  // Cek waktu saat ini
  const getTimeStatus = () => {
    const currentHour = new Date().getHours();
    return {
      isNight: currentHour >= 18 || currentHour < 7,
      isMorning: currentHour >= 7 && currentHour < 18
    };
  };

  // Effect untuk responsive design
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch data menfess
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
          const shuffled = shuffleArray(validMessages);
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

  // Effect untuk flying objects
  useEffect(() => {
    const spawnInterval = setInterval(() => {
      const newObject: FlyingObject = {
        id: Date.now(),
        type: nextTypeRef.current,
        message: MESSAGES[messageIndexRef.current],
        direction: Math.random() > 0.5 ? 'left' : 'right',
        top: Math.random() * 80 + 10,
        duration: 20000
      };

      setFlyingObjects(prev => [...prev, newObject]);

      setTimeout(() => {
        setFlyingObjects(prev => prev.filter(obj => obj.id !== newObject.id));
      }, newObject.duration);

      nextTypeRef.current = nextTypeRef.current === 'bird' ? 'plane' : 'bird';
      messageIndexRef.current = (messageIndexRef.current + 1) % MESSAGES.length;
    }, 720000);

    return () => clearInterval(spawnInterval);
  }, []);

  // Komponen glowing text
  const GlowingText = () => {
    const { isNight } = getTimeStatus();
    
    return (
      <motion.h1
        className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: 1,
          y: 0,
          textShadow: isNight ? [
            "0 0 10px rgba(255,255,255,0.5)",
            "0 0 20px rgba(255,228,0,0.8)",
            "0 0 10px rgba(255,255,255,0.5)"
          ] : "none"
        }}
        transition={{ 
          duration: 0.8,
          textShadow: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
      >
        Menfess warga Unand
        {isNight && (
          <motion.div
            className="absolute inset-0 blur-md pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 0.5, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 3,
              repeat: Infinity
            }}
          >
            <Sparkles className="absolute -top-2 left-1/4 w-6 h-6 text-yellow-400" />
            <Sparkles className="absolute top-1/2 right-1/3 w-5 h-5 text-yellow-400" />
            <Sparkles className="absolute bottom-0 left-1/2 w-4 h-4 text-yellow-400" />
          </motion.div>
        )}
      </motion.h1>
    );
  };

  // Render time icon
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
            animate={{
              textShadow: [
                "0 0 5px rgba(255,255,255,0.3)",
                "0 0 20px rgba(255,255,255,0.8)",
                "0 0 5px rgba(255,255,255,0.3)"
              ]
            }}
            transition={{ duration: 10, repeat: Infinity }}
          >
            🌙
          </motion.span>
        ) : (
          <motion.div
            animate={{ 
              rotate: [0, 20, -20, 0],
              scale: [1, 1.3, 1],
              opacity: [0.8, 1, 0.8]
            }}
            transition={{ duration: 10, repeat: Infinity }}
            className="relative"
          >
            <Sparkles className="h-16 w-16 text-yellow-400 mx-auto drop-shadow-glow" />
          </motion.div>
        )}
      </motion.div>
    );
  };

  // Background section
  const BackgroundSection = () => (
    <div className="absolute inset-0 z-0 h-[700px] w-[120%] -left-[10%] overflow-hidden">
      <div className="relative h-full w-full transform translate-y-5">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -inset-4 lg:-inset-6">
            <div className="relative h-full w-full">
              <BackgroundVideo />
              <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-transparent backdrop-blur-lg" />
              <div className="absolute inset-0 bg-gradient-to-t from-white/30 via-transparent to-transparent backdrop-blur-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Flying object component
  const FlyingObject = ({ object }: { object: FlyingObject }) => (
    <motion.div
      initial={{
        x: object.direction === 'right' ? '-100vw' : '100vw',
        opacity: 0
      }}
      animate={{
        x: object.direction === 'right' ? '100vw' : '-100vw',
        opacity: [0, 1, 1, 0]
      }}
      transition={{
        duration: object.duration,
        ease: 'linear',
        times: [0, 0.1, 0.9, 1]
      }}
      className="fixed z-50 pointer-events-none"
      style={{ top: `${object.top}%` }}
    >
      <div className="relative flex flex-col items-center">
        <Image
          src={`/${object.type}.png`}
          alt={object.type}
          width={object.type === 'bird' ? 80 : 120}
          height={object.type === 'bird' ? 60 : 80}
          className="object-contain"
        />
        <motion.div 
          className="absolute top-full mt-2 bg-white px-4 py-2 rounded-full shadow-lg text-sm max-w-xs text-center border border-gray-200"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          {object.message}
        </motion.div>
      </div>
    </motion.div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-800">
      <InitialAnimation />
      <Navbar />
      
      <main className="flex-grow">
        <AnimatePresence>
          {flyingObjects.map(object => (
            <FlyingObject key={object.id} object={object} />
          ))}
        </AnimatePresence>

        <section className="relative overflow-hidden pt-24 pb-16 md:py-32">
          <BackgroundSection />
          
          <div className="container mx-auto px-4 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="mb-8">
                {renderTimeIcon()}
                <GlowingText />
              </div>
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
                className="bg-gray-800 text-white px-6 md:px-8 py-2.5 md:py-3 rounded-full hover:bg-gray-900 transition-colors shadow-lg"
              >
                <Link href="/message">Kirim Menfess</Link>
              </Button>
              <Button
                asChild
                className="border-2 border-gray-800 bg-white text-gray-800 px-6 md:px-8 py-2.5 md:py-3 rounded-full hover:bg-gray-100 transition-colors shadow-lg"
              >
                <Link href="/search-message">Explore Menfess</Link>
              </Button>
              <Button
                asChild
                className="border-2 border-blue-600 bg-blue-50 text-blue-600 px-6 md:px-8 py-2.5 md:py-3 rounded-full hover:bg-blue-100 transition-colors shadow-lg"
              >
                <Link 
                  href="https://ziwa-351410.web.app"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ziwa - Cari Teman baru & fun space
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-300 mb-4">
                MENFESS TERBARU
              </h2>
              <p className="text-gray-400 max-w-xl mx-auto">
                Trending menfess
              </p>
            </div>

            <div className="relative w-full max-w-7xl mx-auto overflow-hidden mb-16">
              <DynamicCarousel />
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
                  }`}={handleScroll}
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
                            ? 'flex-shrink-0 max-w-7xl mx-auto snap-center p-4 ' 
                            : 'flex-shrink-0 w-1/3 p-4'
                        } bg-white rounded-lg shadow-lg max-w-7xl mx-auto`}
                      >
                        <div className="flex flex-col">
                          <h3 className="font-bold text-lg">{msg.sender}</h3>
                          <p className="text-gray-600">{msg.message}</p>
                          <span className="text-gray-400 text-sm">{getFormattedDate(msg.created_at)}</span>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
                          <section className="py-16 md:py-24 bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-300 mb-4">
                MENFESS TERBARU
              </h2>
              <p className="text-gray-400 max-w-xl mx-auto">
                Trending menfess
              </p>

              </div>
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
                        className={`h-2 w-2 rounded-full ${
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