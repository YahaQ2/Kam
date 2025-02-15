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
  "Hari ini adalah kesempatan baru untuk memulai hal baru"
];

const BackgroundVideo = () => (
  <video 
    autoPlay 
    muted 
    loop 
    playsInline
    className="w-full h-full object-cover"
  >
    <source src="@components/BackgroundVideo"/>
  </video>
);

export default function HomePage() {
  const [recentlyAddedMessages, setRecentlyAddedMessages] = useState<Menfess[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [currentCard, setCurrentCard] = useState(0);
  const [showFlyingObject, setShowFlyingObject] = useState<'bird' | 'plane' | null>(null);
  const [currentMessage, setCurrentMessage] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollInterval = useRef<NodeJS.Timeout>();
  const messageInterval = useRef<NodeJS.Timeout>();

  // Fungsi untuk menampilkan pesan terbang
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
    const controller = new AbortController();
    const fetchMessages = async () => {
      try {
        const response = await fetch(
          `https://unand.vercel.app/v1/api/menfess-spotify-search`,
          { signal: controller.signal }
        );
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data: MenfessResponse = await response.json();
        
        if (data?.status && Array.isArray(data.data)) {
          const validMessages = data.data.filter(validateMenfess);
          if (validMessages.length === 0) throw new Error("Tidak ada data valid");
          setRecentlyAddedMessages(shuffleArray(validMessages));
        } else {
          throw new Error("Format data tidak valid");
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

  useEffect(() => {
    if (recentlyAddedMessages.length > 1) {
      scrollInterval.current = setInterval(() => {
        setRecentlyAddedMessages(prev => {
          const newArray = [...prev];
          const first = newArray.shift();
          return first ? [...newArray, first] : prev;
        });
      }, 5000);
    }

    return () => {
      if (scrollInterval.current) clearInterval(scrollInterval.current);
    };
  }, [recentlyAddedMessages.length]);

  useEffect(() => {
    messageInterval.current = setInterval(showRandomMessage, 720000); // 12 menit
    showRandomMessage(); // Tampilkan pesan pertama

    return () => {
      if (messageInterval.current) clearInterval(messageInterval.current);
    };
  }, []);

  const getTimeStatus = () => {
    const currentHour = new Date().getHours();
    return {
      isNight: currentHour >= 18 || currentHour < 7,
      isMorning: currentHour >= 7 && currentHour < 18
    };
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.8, rotate: -5 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      rotate: 0,
      transition: { type: 'spring', stiffness: 120, damping: 15 } 
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
                src="/bird.gif"
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
                src="/plane.gif"
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
          <div className="absolute inset-0 z-0 overflow-hidden">
            <BackgroundVideo />
            <div className="absolute inset-0 bg-black/30" />
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
          </div>        </section>

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