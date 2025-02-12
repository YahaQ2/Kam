"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/ui/footer";
import { InitialAnimation } from "@/components/initial-animation";
import { Navbar } from "@/components/ui/navbar";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

const VISIBLE_MESSAGES = 8;
const SLIDE_DURATION = 8000;
const ADMIN_MESSAGES = [
  "Semangat untuk hari ini! Kamu selalu luar biasa",
  "Jaga kesehatan dan istirahat yang cukup! 😊",
  "Sudahkah kamu menyapa temanmu hari ini? 👋",
  "Jangan lupa untuk tetap produktif! 📚",
  "Tetap semangat dan jaga kesehatan! 💪",
  "Minum air yang cukup hari ini! 💧",
  "Ingat, kamu itu spesial dan berharga! ✨",
  "Hari baru, kesempatan baru untuk berkembang!",
];

const DynamicCarousel = dynamic(() => import("@/components/carousel"), {
  ssr: false,
  loading: () => <div className="h-64 w-full bg-gray-100 animate-pulse rounded-xl" />
});

const DynamicBackgroundVideo = dynamic(() => import("@/components/background-video"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-gray-100" />
});

const PopupAdminMessage = () => {
  const [showPopup, setShowPopup] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const today = new Date().toDateString();
    const lastShownDate = localStorage.getItem("popupLastShown");

    if (lastShownDate !== today) {
      const randomIndex = Math.floor(Math.random() * ADMIN_MESSAGES.length);
      timeoutRef.current = setTimeout(() => {
        setShowPopup(true);
        localStorage.setItem("popupLastShown", today);
      }, 3000);
    }

    return () => {
      timeoutRef.current && clearTimeout(timeoutRef.current);
    };
  }, []);

  if (!showPopup) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed bottom-4 right-4 z-50 max-w-xs bg-white rounded-lg shadow-lg p-4 border border-gray-200"
      >
        <div className="flex items-start">
          <button 
            onClick={() => setShowPopup(false)}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
          <Sparkles className="h-6 w-6 text-yellow-400 flex-shrink-0" />
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">Pesan Hari Ini</p>
            <p className="text-sm text-gray-500 mt-1">
              {ADMIN_MESSAGES[Math.floor(Math.random() * ADMIN_MESSAGES.length)]}
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

const shuffleArray = (array: Menfess[]) => {
  if (typeof window === "undefined") return array;
  const newArray = [...array];
  
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export default function HomePage() {
  const [messages, setMessages] = useState<Menfess[][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const fetchData = async () => {
      try {
        const response = await fetch(`https://unand.vercel.app/v1/api/menfess-spotify-search`);
        if (!response.ok) throw new Error("Gagal memuat data");
        
        const data: MenfessResponse = await response.json();
        if (!data?.data) throw new Error("Data tidak valid");

        const validMessages = data.data.filter(m => 
          m?.id && m.sender && m.recipient && m.message && m.created_at
        );

        const shuffled = shuffleArray([...validMessages]);
        setMessages([
          shuffled.slice(0, VISIBLE_MESSAGES),
          validMessages.slice(0, VISIBLE_MESSAGES)
        ]);
        
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isMounted]);

  useEffect(() => {
    if (messages.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % messages.length);
      }, SLIDE_DURATION);
    }
    return () => {
      intervalRef.current && clearInterval(intervalRef.current);
    };
  }, [messages.length]);

  const getFormattedDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Tanggal tidak valid";
    }
  };

  const renderTimeIcon = () => {
    if (!isMounted) return <div className="h-16 w-16" />;
    
    const currentHour = new Date().getHours();
    const isNight = currentHour >= 18 || currentHour < 7;

    return (
      <motion.div
        key={isNight ? "night" : "day"}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="relative"
      >
        {isNight ? (
          <div className="relative inline-block">
            <motion.span className="text-4xl">🌙</motion.span>
          </div>
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
    <div className="flex flex-col min-h-screen bg-white text-gray-800 relative overflow-hidden">
      <InitialAnimation />
      <Navbar />

      <div className="absolute inset-0 z-0 opacity-20">
        <DynamicBackgroundVideo />
      </div>

      <main className="flex-grow relative z-10">
        <section className="relative overflow-hidden pt-24 pb-16 md:py-32">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="mb-8">{renderTimeIcon()}</div>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                  Menfess Unand
                </span>
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
                className="bg-gray-800 hover:bg-gray-900 text-white px-8 py-3 rounded-full"
              >
                <Link href="/message">Kirim Menfess</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="text-gray-800 px-8 py-3 rounded-full"
              >
                <Link href="/search-message">Cari Menfess</Link>
              </Button>
              <Button
                asChild
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full"
              >
                <Link href="https://ziwa-351410.web.app">
                  Ziwa Community
                </Link>
              </Button>
            </motion.div>

            <div className="relative w-full max-w-7xl mx-auto overflow-hidden mb-16">
              <DynamicCarousel />
            </div>
          </div>
        </section>

        <PopupAdminMessage />

        <section className="py-16 md:py-24 bg-gray-900 relative">
          <div className="absolute inset-0 opacity-10 bg-[url('/noise.png')]" />
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-300 mb-4">
                {currentSlide === 0 ? "MENFESS ACAK" : "MENFESS TERBARU"}
              </h2>
              <p className="text-gray-400 max-w-xl mx-auto">
                {currentSlide === 0 ? "Pesan-pesan menarik untuk Anda" : "Update terbaru dari komunitas"}
              </p>
            </div>

            {loading ? (
              <div className="h-40 flex items-center justify-center text-gray-300">
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  Memuat pesan...
                </motion.div>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-500 mb-4">{error}</p>
                <Button onClick={() => window.location.reload()}>
                  Coba Lagi
                </Button>
              </div>
            ) : (
              <div className="relative h-[600px] overflow-hidden">
                <AnimatePresence mode="wait">
                  {messages.map((slide, index) => (
                    currentSlide === index && (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4"
                      >
                        {slide.map((msg) => (
                          <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="h-full"
                          >
                            <Link
                              href={`/message/${msg.id}`}
                              className="block h-full bg-gray-800 rounded-xl p-4 hover:shadow-xl transition-all"
                            >
                              <div className="flex justify-between text-sm mb-2 text-gray-300">
                                <span>Dari: {msg.sender}</span>
                                <span>{getFormattedDate(msg.created_at)}</span>
                              </div>
                              <p className="text-gray-200 line-clamp-4">{msg.message}</p>
                              {msg.track && (
                                <div className="mt-4 flex items-center gap-2">
                                  <img
                                    src={msg.track.cover_img}
                                    alt="Album cover"
                                    className="w-12 h-12 rounded"
                                  />
                                  <div>
                                    <p className="text-sm text-gray-300 font-medium">
                                      {msg.track.title}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                      {msg.track.artist}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </Link>
                          </motion.div>
                        ))}
                      </motion.div>
                    )
                  ))}
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