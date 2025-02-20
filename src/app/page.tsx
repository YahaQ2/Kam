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

// Type definitions for our data structures
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

// Constants for carousel configuration
const VISIBLE_MESSAGES = 6;
const CAROUSEL_DISPLAY_TIME = 7000; // 7 seconds per slide
const MOTIVATION_MESSAGES = [
  "Semangat untuk hari ini kamu selalu luar biasa",
  "Kamu harus jaga kesehatan mu, tidurnya di jaga ya! 😊",
  "Apa kabar,kamu inget ya bahagia dulu. masalahnya lupain dulu! 👋",
  "Cinta itu indah, tapi jangan lupa kuliah! 📚",
  "Tetap semangat dan jaga kesehatan! 💪",
  "Aku percaya kamu bisa! selamat ya udah lewatin banyak tantangan di semester ini ",
  "Capek ya! ututut tut..istirahat sebentar ya abis itu lanjut lagi💗",
  "Kamu keren udaah nyampe ke tahap ini tetap semangat ya! 💪",
  "Jangan lupa minum air putih hari ini! 💧",
  "Ingat ya, kamu itu spesial dan hebat! ✨",
  "Hari ini adalah kesempatan baru untuk memulai hal baru",
  "ingat ya harus tetap semangat, kamu sudah hebat hari ini",
];

export default function HomePage() {
  // State management for various features
  const [latestMessages, setLatestMessages] = useState<Menfess[]>([]);
  const [randomMessages, setRandomMessages] = useState<Menfess[]>([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeLatestIndex, setActiveLatestIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showFlyingObject, setShowFlyingObject] = useState<'bird' | 'plane' | null>(null);
  const [currentMessage, setCurrentMessage] = useState("");
  
  // Refs for interval management
  const messageInterval = useRef<NodeJS.Timeout>();
  const allMessagesCache = useRef<Menfess[]>([]);

  // Utility function to get random unique messages
  const getRandomUniqueMessage = (existingIds: Set<number>): Menfess | null => {
    const availableMessages = allMessagesCache.current.filter(msg => !existingIds.has(msg.id));
    if (availableMessages.length === 0) return null;
    return availableMessages[Math.floor(Math.random() * availableMessages.length)];
  };

  // Data validation function
  const validateMenfess = (data: any): data is Menfess => {
    return (
      typeof data?.id === 'number' &&
      typeof data?.sender === 'string' &&
      typeof data?.recipient === 'string' &&
      typeof data?.message === 'string'
    );
  };

  // Date formatting utility
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

  // Function to handle motivation messages
  const showRandomMessage = () => {
    const isBird = Math.random() < 0.5;
    const message = MOTIVATION_MESSAGES[Math.floor(Math.random() * MOTIVATION_MESSAGES.length)];
    setCurrentMessage(message);
    setShowFlyingObject(isBird ? 'bird' : 'plane');
    setTimeout(() => setShowFlyingObject(null), 10000);
  };

  // Time-based theme management
  const getTimeStatus = () => {
    const currentHour = new Date().getHours();
    return {
      isNight: currentHour >= 18 || currentHour < 7,
      isMorning: currentHour >= 7 && currentHour < 18
    };
  };

  // Enhanced moon/sun icon renderer
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
            {/* Enhanced Moon Core */}
            <motion.span
              className="text-4xl relative z-10 block"
              animate={{
                filter: [
                  'brightness(1.2)',
                  'brightness(1.5)',
                  'brightness(1.2)'
                ],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
              }}
            >
              🌙
            </motion.span>

            {/* Enhanced Moon Shine Effect */}
            <motion.div
              className="absolute inset-0 -z-0"
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0, 0.8, 0],
                rotate: [0, 360],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-yellow-300/40 rounded-full blur-[25px]" />
            </motion.div>

            {/* Enhanced Glow Effect */}
            <motion.div
              className="absolute inset-0"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
              }}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-yellow-400/30 rounded-full blur-[35px]" />
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

  // Message Card Component
  const MessageCard = ({ message, featured = false }: { message: Menfess, featured?: boolean }) => (
    <Link href={`/message/${message.id}`} className="block h-full">
      <motion.div 
        className={`h-full bg-gray-900 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden ${
          featured ? 'scale-105' : ''
        }`}
        whileHover={{ scale: featured ? 1.08 : 1.05 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <div className="px-4 pt-4">
          <div className="flex justify-between text-sm mb-2">
            <div className="text-gray-300">
              <span className="font-semibold">From:</span> {message.sender}
            </div>
            <div className="text-gray-300">
              <span className="font-semibold">To:</span> {message.recipient}
            </div>
          </div>
        </div>
        
        <div className="px-4 py-2">
          <div className="bg-gray-800 rounded-xl overflow-hidden">
            <div className="p-4 max-w-full">
              <p className="text-white text-sm sm:text-base break-words whitespace-pre-wrap">
                {message.message || 'Pesan tidak tersedia'}
              </p>
            </div>
            
            {message.track?.title && (
              <div className="flex items-center border-t border-gray-700 p-3 bg-gray-850">
                {message.track.cover_img && (
                  <div className="w-12 h-12 mr-3 flex-shrink-0">
                    <img 
                      src={message.track.cover_img} 
                      alt={message.track.title} 
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                )}
                <div className="overflow-hidden">
                  <h4 className="text-white font-medium truncate text-sm">
                    {message.track.title}
                  </h4>
                  {message.track.artist && (
                    <p className="text-gray-400 text-xs truncate">
                      {message.track.artist}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {message.spotify_id && (
            <div className="mt-4">
              <iframe
                className="w-full rounded-lg shadow-md"
                src={`https://open.spotify.com/embed/track/${message.spotify_id}`}
                width="100%"
                height="80"
                frameBorder="0"
                allow="encrypted-media"
              />
            </div>
          )}
        </div>
        
        <motion.div 
          className="p-4 bg-gray-800 rounded-b-2xl relative"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-24 h-0.5 bg-gray-600 rounded-full" />
          <p className="text-sm text-white text-center mt-2">
            {getFormattedDate(message.created_at)}
          </p>
        </motion.div>
      </motion.div>
    </Link>
  );

  // Fetch messages effect
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
          allMessagesCache.current = validMessages;
          
          validMessages.sort((a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          
          const latest = validMessages.slice(0, 5);
          setLatestMessages(latest);
          
          const latestIds = new Set(latest.map(msg => msg.id));
          const randomMsgs: Menfess[] = [];
          
          for (let i = 0; i < 5; i++) {
            const currentIds = new Set([...latestIds, ...randomMsgs.map(msg => msg.id)]);
            const randomMsg = getRandomUniqueMessage(currentIds);
            if (randomMsg) randomMsgs.push(randomMsg);
          }
          
          setRandomMessages(randomMsgs);
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          setError(err instanceof Error ? err.message : "Terjadi kesalahan");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
    return () => controller.abort();
  }, []);

  // Motivation message interval effect
  useEffect(() => {
    messageInterval.current = setInterval(showRandomMessage, 720000);
    showRandomMessage();
    return () => {
      if (messageInterval.current) clearInterval(messageInterval.current);
    };
  }, []);

  // Enhanced carousel rotation effect
  useEffect(() => {
    if (loading || latestMessages.length === 0) return;
    
    const interval = setInterval(() => {
      if (activeSlide === 0) {
        setActiveLatestIndex(prev => {
          const nextIndex = (prev + 1) % latestMessages.length;
          if (nextIndex === 0) {
            setActiveSlide(1);
          }
          return nextIndex;
        });
      } else {
        setActiveSlide(prev => (prev + 1) % VISIBLE_MESSAGES);
      }
    }, CAROUSEL_DISPLAY_TIME);
    
    return () => clearInterval(interval);
  }, [loading, latestMessages.length, activeSlide, activeLatestIndex]);

  // Random messages refresh effect
  useEffect(() => {
    if (activeSlide === 0 && allMessagesCache.current.length > 5) {
      const latestIds = new Set(latestMessages.map(msg => msg.id));
      const newRandomMsgs: Menfess[] = [];
      
      for (let i = 0; i < 5; i++) {
        const currentIds = new Set([
          ...latestIds, 
          ...newRandomMsgs.map(msg => msg.id)
        ]);
        const randomMsg = getRandomUniqueMessage(currentIds);
        if (randomMsg) newRandomMsgs.push(randomMsg);
      }
      
      if (newRandomMsgs.length > 0) {
        setRandomMessages(newRandomMsgs);
      }
    }
  }, [activeSlide, latestMessages]);

  // Animation variants for smooth transitions
  const cardVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 100, damping: 12 }
    },
    exit: { 
      opacity: 0, 
      scale: 0.9, 
      y: -20,
      transition: { duration: 0.3 }
    }
  };

  // Flying message components for motivation
  const FlyingMessage = () => (
    <div className="fixed bottom-8 left-0 right-0 z-50 flex justify-center">
      <AnimatePresence>
        {showFlyingObject && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-gray-200 flex items-center gap-3 max-w-full mx-4"
          >
            {showFlyingObject === 'bird' && (
              <motion.img
                src="/bird-flying.png"
                alt="Burung"
                className="h-12 w-12 flex-shrink-0"
                initial={{ x: -100 }}
                animate={{ x: 0 }}
              />
            )}

            <span className="text-gray-800 font-medium flex-grow text-center">
              {currentMessage}
            </span>

            {showFlyingObject === 'plane' && (
              <motion.img
                src="/plane-flying.png"
                alt="Pesawat"
                className="h-12 w-12 flex-shrink-0"
                initial={{ x: 100 }}
                animate={{ x: 0 }}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  // Flying objects animation component
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

  // Enhanced carousel content renderer
  const renderCarouselContent = () => {
    if (activeSlide === 0) {
      // First slide shows one of the latest messages at a time
      const message = latestMessages[activeLatestIndex];
      
      if (!message) return <div className="text-gray-300">No message available</div>;
      
      return (
        <motion.div
          key={`latest-${message.id}-${activeLatestIndex}`}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="mx-auto max-w-md"
        >
          <MessageCard message={message} featured={true} />
        </motion.div>
      );
    } else {
      // Other slides show 1 random message each
      const randomIndex = activeSlide - 1;
      const message = randomIndex < randomMessages.length ? randomMessages[randomIndex] : null;
      
      if (!message) return <div className="text-gray-300">No message available</div>;
      
      return (
        <motion.div
          key={`random-${message.id}`}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="mx-auto max-w-md"
        >
          <MessageCard message={message} featured={true} />
        </motion.div>
      );
    }
  };

  // Main component render
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
              <p className="text-lg md:text-xl text-gray-200 max-w-3xl mx-auto mb-12">
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
                className="border-2 border-gray-100 bg-transparent text-gray-900 hover:bg-gray-100/10 px-6 md:px-8 py-2.5 md:py-3 rounded-full transition-colors shadow-lg"
              >
                <Link href="/search-message">Explore Menfess</Link>
              </Button>
               <Button
                asChild
                className="border-2 border-blue-600 bg-blue-50 text-blue-600 px-6 md:px-8 py-2.5 md:py-3 rounded-full hover:bg-blue-100 transition-colors shadow-lg"
              >
                <Link href="https://ziwa-351410.web.app" target="_blank" rel="noopener noreferrer">
                  Ziwa - Cari Teman baru & fun space
                </Link>
              </Button>
              <Link
                href="https://v0-kopih-rhlgiz.vercel.app/"
                className="inline-flex items-center justify-center px-4 py-2 mb-8 text-sm md:text-base font-medium text-black-600 hover:text-black-800 transition-colors border border-blue-300 rounded-full hover:border-blue-400"
              >
                <span>kuisyuned(upload kuisioner)</span>
              </Link>

              <Link
                href="https://forms.zohopublic.com/notnoting12gm1/form/Saran/formperma/8hcRs5pwX77B9AprPeIsvWElcwC1s3JJZlReOgJ3vdc"
                className="inline-flex items-center justify-center px-4 py-2 mb-8 text-sm md:text-base font-medium text-gray-600 hover:text-gray-800 transition-colors border border-gray-300 rounded-full hover:border-gray-400"
              >
                <span>saran/masukan/fitur baru</span>
              </Link>
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
              <div className="h-40 flex items-center justify-center text-gray-300">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-10 h-10 border-4 border-gray-300 border-t-blue-500 rounded-full"
                />
              </div>
            ) : error ? (
              <p className="text-red-500 text-center">{error}</p>
            ) : latestMessages.length === 0 ? (
              <p className="text-gray-300 text-center">Tidak ada pesan terbaru</p>
            ) : (
              <div className="relative max-w-6xl mx-auto px-4">
                <AnimatePresence mode="wait">
                  <div className="relative min-h-[400px]" key={`slide-${activeSlide}-${activeLatestIndex}`}>
                    {renderCarouselContent()}
                  </div>
                </AnimatePresence>
                
                <div className="flex justify-center space-x-3 mt-12">
                  {Array.from({ length: VISIBLE_MESSAGES }).map((_, index) => (
                    <motion.button
                      key={`indicator-${index}`}
                      className={`h-3 rounded-full ${activeSlide === index ? 'w-8 bg-blue-500' : 'w-3 bg-gray-600'}`}
                      onClick={() => setActiveSlide(index)}
                      whileHover={{ scale: 1.2 }}
                      animate={{ 
                        scale: activeSlide === index ? [1, 1.1, 1] : 1,
                        transition: { 
                          duration: 1,
                          repeat: activeSlide === index ? Infinity : 0,
                          repeatType: "reverse"
                        }
                      }}
                    />
                  ))}
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