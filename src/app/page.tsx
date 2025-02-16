"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/ui/footer";
import { InitialAnimation } from "@/components/initial-animation";
import { Navbar } from "@/components/ui/navbar";
import Link from "next/link";
import { Sparkles } from 'lucide-react';
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
const MOTIVATION_MESSAGES = [
  "Semangat untuk hari ini kamu selalu luar biasa",
  "Kamu harus jaga kesehatan mu, tidurnya di jaga ya! 😊",
  "Sudahkah kamu menyapa temanmu hari ini? 👋",
  "Cinta itu indah, tapi jangan lupa kuliah! 📚",
  "Tetap semangat dan jaga kesehatan! 💪",
  "Jangan lupa minum air putih hari ini! 💧",
  "Ingat ya, kamu itu spesial dan unik! ✨",
  "Hari ini adalah kesempatan baru untuk memulai hal baru",
  "ingat ya harus tetap semangat, kamu sudah hebat hari ini",
];

export default function HomePage() {
const [activeSlide, setActiveSlide] = useState(0);
const [randomMessage, setRandomMessage] = useState(null);
  
  const [recentlyAddedMessages, setRecentlyAddedMessages] = useState<Menfess[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [currentCard, setCurrentCard] = useState(0);
  const [showFlyingObject, setShowFlyingObject] = useState<'bird' | 'plane' | null>(null);
  const [currentMessage, setCurrentMessage] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const messageInterval = useRef<NodeJS.Timeout>();
  const carouselInterval = useRef<NodeJS.Timeout>();

  const shuffleArray = (array: Menfess[]) => {
    if (!array.length) return [];
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

  const showRandomMessage = () => {
    const isBird = Math.random() < 0.5;
    const message = MOTIVATION_MESSAGES[Math.floor(Math.random() * MOTIVATION_MESSAGES.length)];
    
    setCurrentMessage(message);
    setShowFlyingObject(isBird ? 'bird' : 'plane');

    setTimeout(() => {
      setShowFlyingObject(null);
    }, 10000);
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
          validMessages.sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          const latestMessage = validMessages[0];
          const remainingMessages = shuffleArray(validMessages.slice(1));
          const finalMessages = [latestMessage, ...remainingMessages].slice(0, VISIBLE_MESSAGES * 2);
          setRecentlyAddedMessages(finalMessages);
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
  if (!isMobile && activeSlide === 1 && recentlyAddedMessages.length > 0) {
    const randomIndex = Math.floor(Math.random() * recentlyAddedMessages.length);
    setRandomMessage(recentlyAddedMessages[randomIndex]);
  }
}, [activeSlide, isMobile, recentlyAddedMessages]);
  
  const interval = setInterval(() => {
    setActiveSlide(prev => (prev === 0 ? 1 : 0));
  }, 5000); // Ganti slide setiap 5 detik

  return () => clearInterval(interval);
}, [isMobile]);

useEffect(() => {
  if (isMobile) return;
  
  const interval = setInterval(() => {
    setActiveSlide(prev => (prev === 0 ? 1 : 0));
  }, 5000); // Ganti slide setiap 5 detik

  return () => clearInterval(interval);
}, [isMobile]);


  useEffect(() => {
    if (containerRef.current && isMobile) {
      const cardWidth = containerRef.current.offsetWidth;
      containerRef.current.scrollTo({
        left: currentCard * cardWidth,
        behavior: 'smooth'
      });
    }
  }, [currentCard, isMobile]);

  const getTimeStatus = () => {
    const currentHour = new Date().getHours();
    return {
      isNight: currentHour >= 18 || currentHour < 7,
      isMorning: currentHour >= 7 && currentHour < 18
    };
  };

  const handleScroll = () => {
    if (containerRef.current && isMobile) {
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
          <motion.div
            className="relative inline-block"
            animate={{ 
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {/* Moon Core */}
            <motion.span
              className="text-4xl relative z-10 block"
              animate={{
                filter: [
                  'brightness(1)',
                  'brightness(1.2)',
                  'brightness(1)'
                ],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
              }}
            >
              🌙
            </motion.span>
            
            {/* Moon Shine Effect */}
            <motion.div
              className="absolute inset-0 -z-0"
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0, 0.6, 0],
                rotate: [0, 360],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-yellow-300/30 rounded-full blur-[20px]" />
            </motion.div>

            {/* Glow Effect */}
            <motion.div
              className="absolute inset-0"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.4, 0.6, 0.4],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
              }}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-yellow-400/20 rounded-full blur-[30px]" />
            </motion.div>
          </motion.div>
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

  const FlyingMessage = () => (
    <div className="fixed bottom-8 left-0 right-0 z-50 flex justify-center">
      <AnimatePresence>
        {showFlyingObject && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-gray-200 flex items-center gap-3"
          >
            {showFlyingObject === 'bird' && (
              <motion.img
                src="/bird-flying.png"
                alt="Burung"
                className="h-12 w-12"
                initial={{ x: -100 }}
                animate={{ x: 0 }}
              />
            )}
            
            <span className="text-gray-800 font-medium">
              {currentMessage}
            </span>

            {showFlyingObject === 'plane' && (
              <motion.img
                src="/plane-flying.png"
                alt="Pesawat"
                className="h-12 w-12"
                initial={{ x: 100 }}
                animate={{ x: 0 }}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const FlyingObjects = () => (
    <>
      <AnimatePresence>
        {showFlyingObject === 'bird' && (
          <motion.div
            key="bird"
            initial={{ x: '-100vw', y: '100vh' }}
            animate={{ 
              x: '100vw',
              y: '30vh',
              transition: { duration: 8, ease: 'linear' }
            }}
            className="fixed z-40 pointer-events-none"
          >
            <img src="/bird-flying.png" alt="Burung" className="w-24 h-24 animate-float" />
          </motion.div>
        )}

        {showFlyingObject === 'plane' && (
          <motion.div
            key="plane"
            initial={{ x: '100vw', y: '20vh' }}
            animate={{ 
              x: '-100vw',
              y: '40vh',
              transition: { duration: 6, ease: 'linear' }
            }}
            className="fixed z-40 pointer-events-none"
          >
            <img src="/plane-flying.png" alt="Pesawat" className="w-32 h-32 animate-float" />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-800">
      <InitialAnimation />
      <Navbar />
      
      <FlyingObjects />
      <FlyingMessage />

      <main className="flex-grow">
        <section className="relative min-h-screen overflow-hidden pt-24 pb-16 md:py-32">
          <div className="absolute inset-0 z-0 h-[1000px] overflow-hidden">
            <div className="relative h-[100%] w-[100%]">
              <div className="absolute inset-0 -left-[10%] -top-9 w-[130%] lg:-left-[15%] lg:w-[130%]">
                <div className="relative h-full w-full before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/30 before:via-transparent before:to-transparent before:backdrop-blur-lg before:[mask-image:linear-gradient(to_bottom,white_30%,transparent_90%)] after:absolute after:inset-0 after:bg-gradient-to-t after:from-white/30 after:via-transparent after:to-transparent after:backdrop-blur-lg after:[mask-image:linear-gradient(to_top,white_30%,transparent_90%)]">
                  <BackgroundVideo />
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
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                <motion.span
                  className={`inline-block relative ${
                    getTimeStatus().isNight 
                      ? 'text-white drop-shadow-glow'
                      : 'text-gray-900'
                  }`}
                >
                  Menfess warga Unand
                  {getTimeStatus().isNight && (
                    <motion.span
                      className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent"
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    />
                  )}
                </motion.span>
              </h1>
              <p className="text-lg md:text-xl text-yellow-200 max-w-3xl mx-auto mb-12">
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
                className="bg-gray-100 text-gray-900 px-6 md:px-8 py-2.5 md:py-3 rounded-full hover:bg-gray-200 transition-colors shadow-lg"
              >
                <Link href="/message">Kirim Menfess</Link>
              </Button>
              <Button
                asChild
                className="border-2 border-gray-100 bg-transparent text-gray-100 hover:bg-gray-100/10 px-6 md:px-8 py-2.5 md:py-3 rounded-full transition-colors shadow-lg"
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

    {loading ? (
      <div className="h-40 flex items-center justify-center text-gray-300">Memuat...</div>
    ) : error ? (
      <p className="text-red-500 text-center">{error}</p>
    ) : recentlyAddedMessages.length === 0 ? (
      <p className="text-gray-300 text-center">Tidak ada pesan terbaru</p>
    ) : (
      <div className="relative">
        {/* Desktop View */}
        {!isMobile && (
          <div className="relative overflow-hidden">
            <AnimatePresence mode='wait'>
              {activeSlide === 0 ? (
                <motion.div
                  key="latest"
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.5 }}
                  className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4"
                >
                  {recentlyAddedMessages.slice(0, 5).map((msg) => (
                    <MessageCard key={msg.id} msg={msg} />
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="random"
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.5 }}
                  className="flex justify-center"
                >
                  {randomMessage && <MessageCard msg={randomMessage} />}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Mobile View */}
        {isMobile && (
          <div 
            ref={containerRef}
            className="overflow-x-auto snap-x snap-mandatory scrollbar-hide px-4"
            onScroll={handleScroll}
          >
            <div className="flex">
              {recentlyAddedMessages.slice(0, VISIBLE_MESSAGES).map((msg, index) => (
                <motion.div
                  key={msg.id}
                  className="flex-shrink-0 w-full snap-center p-4"
                >
                  <MessageCard msg={msg} />
                </motion.div>
              ))}
            </div>
            <div className="flex justify-center space-x-2 mt-4">
              {recentlyAddedMessages.slice(0, VISIBLE_MESSAGES).map((_, index) => (
                <motion.div
                  key={index}
                  className={`h-2 w-2 rounded-full ${
                    currentCard === index ? 'bg-gray-300' : 'bg-gray-600'
                  }`}
                  animate={{ scale: currentCard === index ? 1.2 : 1 }}
                />
              ))}
            </div>
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