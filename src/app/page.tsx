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
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const shuffleArray = (array: Menfess[]) => {
    if (!array.length) return [];
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray.slice(0, VISIBLE_MESSAGES * 2);
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
    return {
      isNight: currentHour >= 18 || currentHour < 7,
      isMorning: currentHour >= 7 && currentHour < 18
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

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setCurrentMessageIndex(prev => (prev + 1) % MESSAGES.length);
    }, 180000);

    const spawnInterval = setInterval(() => {
      const newObject: FlyingObject = {
        id: Date.now(),
        type: Math.random() > 0.5 ? 'bird' : 'plane',
        message: MESSAGES[currentMessageIndex],
        direction: Math.random() > 0.5 ? 'left' : 'right',
        top: Math.random() *1,
        duration:8000
      };

      setFlyingObjects(prev => [...prev, newObject]);

      setTimeout(() => {
        setFlyingObjects(prev => prev.filter(obj => obj.id !== newObject.id));
      }, 15000);
    }, 10000);

    return () => {
      clearInterval(messageInterval);
      clearInterval(spawnInterval);
    };
  }, [currentMessageIndex]);

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
            <motion.div 
              className="absolute inset-0 w-full h-full blur-md bg-yellow-400/30"
              animate={{
                opacity: [0, 0.5, 0],
                scale: [1, 1.5, 1]
              }}
              transition={{ duration: 10, repeat: Infinity }}
            />
          </motion.div>
        )}
      </motion.div>
    );
  };

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
        <div className="absolute top-full mt-2 bg-white px-4 py-2 rounded-full shadow-lg text-sm max-w-xs text-center border border-gray-200">
          {object.message}
        </div>
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
          <div className="absolute inset-0 z-0 h-[700px] w-[120%] -left-[10%] overflow-hidden">
            <div className="relative h-full w-full transform translate-y-10">
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -inset-4 lg:-inset-6">
                  <div className="relative h-full w-full before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/30 before:via-transparent before:to-transparent before:backdrop-blur-lg before:[mask-image:linear-gradient(to_bottom,white_30%,transparent_90%)] after:absolute after:inset-0 after:bg-gradient-to-t after:from-white/30 after:via-transparent after:to-transparent after:backdrop-blur-lg after:[mask-image:linear-gradient(to_top,white_30%,transparent_90%)]">
                    <BackgroundVideo />
                  </div>
                </div>
              </div>
            </div>
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
                </Link>
              </Button>
            </motion.div>

          </div>
        </section>
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
                      ? ' overflow-x-auto snap-x snap-mandatory scrollbar-hide px-4' 
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
                            ? 'flex-shrink-0 w-full snap-center p-4 ' 
                            : 'flex-shrink-0 w-1/3 p-4'
                        } bg-white rounded-lg shadow-lg`}
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
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}