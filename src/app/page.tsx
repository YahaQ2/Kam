"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/ui/footer";
import { InitialAnimation } from "@/components/initial-animation";
import { Navbar } from "@/components/ui/navbar";
import Link from "next/link";
import { Sparkles } from 'lucide-react';
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

const MessageCard = ({ msg }: { msg: Menfess }) => (
  <Link href={`/message/${msg.id}`} className="block h-full w-full p-4">
    <motion.div 
      className="h-full w-full bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
      whileHover={{ scale: 1.02 }}
    >
      <div className="px-4 pt-4">
        <div className="flex justify-between text-sm mb-2">
          <div className="text-gray-300">
            <span className="font-semibold">From:</span> {msg.sender}
          </div>
          <div className="text-gray-300">
            <span className="font-semibold">To:</span> {msg.recipient}
          </div>
        </div>
        
        {msg.track?.cover_img && (
          <div className="relative aspect-square w-full mb-4 rounded-xl overflow-hidden">
            <img
              src={msg.track.cover_img}
              alt="Track cover"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="text-gray-300 text-sm mb-4 line-clamp-3">
          {msg.message}
        </div>

        <div className="flex justify-between items-center text-xs text-gray-400">
          <span>
            {new Date(msg.created_at).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            })}
          </span>
          {msg.track?.title && (
            <span className="truncate max-w-[120px]">
              🎵 {msg.track.title}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  </Link>
);

export default function HomePage() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [randomMessage, setRandomMessage] = useState<Menfess | null>(null);
  const [recentlyAddedMessages, setRecentlyAddedMessages] = useState<Menfess[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [currentCard, setCurrentCard] = useState(0);
  const [showFlyingObject, setShowFlyingObject] = useState<'bird' | 'plane' | null>(null);
  const [currentMessage, setCurrentMessage] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const messageInterval = useRef<NodeJS.Timeout>();

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

  const showRandomMessage = () => {
    const isBird = Math.random() < 0.5;
    const message = MOTIVATION_MESSAGES[Math.floor(Math.random() * MOTIVATION_MESSAGES.length)];
    setCurrentMessage(message);
    setShowFlyingObject(isBird ? 'bird' : 'plane');
    setTimeout(() => setShowFlyingObject(null), 10000);
  };

  const getTimeStatus = () => {
    const currentHour = new Date().getHours();
    return { 
      isNight: currentHour >= 18 || currentHour < 7,
      isMorning: currentHour >= 7 && currentHour < 18
    };
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
          setRecentlyAddedMessages(validMessages.slice(0, VISIBLE_MESSAGES * 2));
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
    messageInterval.current = setInterval(showRandomMessage, 720000);
    showRandomMessage();
    return () => { if (messageInterval.current) clearInterval(messageInterval.current); };
  }, []);

  useEffect(() => {
    if (isMobile) return;
    const interval = setInterval(() => setActiveSlide(prev => prev === 0 ? 1 : 0), 5000);
    return () => clearInterval(interval);
  }, [isMobile]);

  useEffect(() => {
    if (!isMobile && activeSlide === 1 && recentlyAddedMessages.length > 0) 
      const randomIndex = Math.floor(Math.random() * recentlyAddedMessages.length);
      setRandomMessage(recentlyAddedMessages[randomIndex]);
    }
  }, [activeSlide, isMobile, recentlyAddedMessages]);

  const handleScroll = () => {
    if (containerRef.current && isMobile) {
      const scrollPosition = containerRef.current.scrollLeft;
      const cardWidth = containerRef.current.offsetWidth;
      setCurrentCard(Math.round(scrollPosition / cardWidth));
    }
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
            <span className="text-gray-800 font-medium">{currentMessage}</span>
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

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-800">
      <InitialAnimation />
      <Navbar />
      
      <FlyingMessage />

      <main className="flex-grow">
        <section className="relative min-h-screen overflow-hidden pt-24 pb-16 md:py-32">
          <div className="absolute inset-0 z-0 h-[1000px] overflow-hidden">
            <div className="relative h-[100%] w-[100%]">
              <div className="absolute inset-0 -left-[10 %] -top-9 w-[130%] lg:-left-[15%] lg:w-[130%]">
                <div className="relative h-full w-full before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/30 before:via-transparent before:to-transparent before:backdrop-blur-lg before:[mask-image:linear-gradient(to_bottom,white_30%,transparent_90%)] after:absolute after:inset-0 after:bg-gradient-to-t after:from-white/30 after:via-transparent after:to-transparent after:backdrop-blur-lg after:[mask-image:linear-gradient(to_top,white_30%,transparent_90%)]">
                  <BackgroundVideo />
                </div>
              </div>
            </div>
          </div>
        
          <div className="container mx-auto px-4 text-center relative z-10">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Menfess warga Unand
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
                <AnimatePresence mode='wait'>
                  <motion.div
                    key={activeSlide}
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.5 }}
                    className={activeSlide === 0 ? "grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4" : "flex justify-center"}
                  >
                    {activeSlide === 0 ? (
                      recentlyAddedMessages.slice(0, 5).map((msg) => (
                        <MessageCard key={msg.id} msg={msg} />
                      ))
                    ) : (
                      randomMessage && <MessageCard msg={randomMessage} />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            )}
          </div>
        </section>
      </main>

     <Footer />
    </div>
  );
}
    