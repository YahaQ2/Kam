"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/ui/footer";
import { InitialAnimation } from "@/components/initial-animation";
import { Navbar } from "@/components/ui/navbar";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowUpRight, Music, Heart, MessageCircle } from 'lucide-react';
import { CarouselCard } from "@/components/carousel-card";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useDebouncedCallback } from "use-debounce";

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

const DynamicCarousel = dynamic(() => import("@/components/carousel").then((mod) => mod.Carousel), {
  ssr: false,
  loading: () => <div className="w-full h-64 bg-gray-100 animate-pulse rounded-xl" />
});

// Type guard untuk validasi response API
function isMenfessResponse(data: any): data is MenfessResponse {
  return data && typeof data === 'object' && 'data' in data && Array.isArray(data.data);
}

export default function HomePage() {
  const [recentlyAddedMessages, setRecentlyAddedMessages] = useState<Menfess[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [currentCard, setCurrentCard] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"]
  });
  
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`https://unand.vercel.app/v1/api/menfess-spotify-search`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const responseData = await response.json();
        
        if (isMenfessResponse(responseData)) {
          const sortedMessages = responseData.data
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 5);
          
          setRecentlyAddedMessages(sortedMessages);
        } else {
          throw new Error("Invalid API response structure");
        }
      } catch (err) {
        let errorMessage = "Terjadi kesalahan";
        if (err instanceof Error) errorMessage = err.message;
        else if (typeof err === "string") errorMessage = err;
        
        setError(errorMessage);
        console.error("API Error:", err);
      } finally {
        setLoading(false);
      }
    };
  
    fetchMessages();
  }, []);

  const handleScroll = useDebouncedCallback(() => {
    if (containerRef.current) {
      const cardWidth = containerRef.current.offsetWidth;
      const newCard = Math.round(containerRef.current.scrollLeft / cardWidth);
      setCurrentCard(Math.min(newCard, recentlyAddedMessages.length - 1));
    }
  }, 100);

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -50 }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900">
      <InitialAnimation />
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section 
          ref={targetRef}
          className="relative h-[90vh] flex items-center justify-center overflow-hidden"
        >
          <motion.div 
            style={{ opacity, scale }}
            className="container mx-auto px-4 text-center relative z-10"
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
            >
              Sampaikan Perasaanmu
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto"
            >
              Berbagi pesan dan musik secara anonim dengan komunitas Universitas Andalas
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row justify-center gap-6 mb-16"
            >
              <Button
                asChild
                className="h-14 px-8 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg shadow-lg hover:shadow-xl transition-all"
              >
                <Link href="/message">
                  <MessageCircle className="mr-3 h-6 w-6" />
                  Kirim Menfess
                </Link>
              </Button>
              
              <Button
                asChild
                variant="outline"
                className="h-14 px-8 rounded-2xl border-2 border-gray-900 hover:bg-gray-50 text-lg hover:shadow-md transition-all"
              >
                <Link href="/search-message">
                  <Music className="mr-3 h-6 w-6" />
                  Jelajahi Menfess
                </Link>
              </Button>
            </motion.div>
          </motion.div>

          <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-white/30" />
        </section>

        {/* Featured Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Mengapa Memilih Platform Kami?
              </h2>
              <p className="text-gray-600 text-lg md:text-xl">
                Platform eksklusif untuk mahasiswa Unand dalam berbagi pesan dan musik secara kreatif
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "0px 0px -50px 0px" }}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                  <MessageCircle className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Anonimitas Terjaga</h3>
                <p className="text-gray-600">Kirim pesan tanpa khawatir identitas terbuka</p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "0px 0px -50px 0px" }}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                  <Music className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Integrasi Spotify</h3>
                <p className="text-gray-600">Bagikan lagu favoritmu langsung dari Spotify</p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "0px 0px -50px 0px" }}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="w-16 h-16 bg-pink-100 rounded-xl flex items-center justify-center mb-6">
                  <Heart className="w-8 h-8 text-pink-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Komunitas Ramah</h3>
                <p className="text-gray-600">Terkoneksi dengan ribuan mahasiswa Unand</p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Carousel Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h3 className="text-3xl font-bold text-center mb-12">
              Menfess Terpopuler
            </h3>
            <div className="relative w-full max-w-7xl mx-auto">
 <DynamicCarousel />
            </div>
          </div>
        </section>

        {/* Recent Menfess Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Menfess Terbaru
              </h2>
              <p className="text-gray-600 text-lg">
                Lihat pesan-pesan terbaru dari komunitas kami
              </p>
            </div>

            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-64 rounded-2xl" />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="text-red-600 mb-4">⚠️ {error}</div>
                <Button onClick={() => window.location.reload()}>
                  Coba Lagi
                </Button>
              </div>
            ) : recentlyAddedMessages.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                Belum ada menfess terbaru
              </div>
            ) : (
              <div className="relative">
                <div 
                  ref={containerRef}
                  className={cn(
                    "grid gap-6 pb-4",
                    isMobile 
                      ? "overflow-x-auto snap-x snap-mandatory scrollbar-hide grid-flow-col auto-cols-[85%]"
                      : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                  )}
                  onScroll={handleScroll}
                >
                  <AnimatePresence mode="wait">
                    {recentlyAddedMessages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        transition={{ duration: 0.3 }}
                        className={cn(
                          "relative group",
                          isMobile && "snap-center"
                        )}
                      >
                        <Link 
                          href={`/message/${msg.id}`}
                          className="block h-full"
                        >
                          <CarouselCard 
                            to={msg.recipient} 
                            from={msg.sender} 
                            message={msg.message}
                            songTitle={msg.track?.title || 'Lagu Tanpa Judul'}
                            artist={msg.track?.artist || 'Artis Tidak Diketahui'}
                            coverUrl={msg.track?.cover_img || '/default-cover.png'}
                            className="h-full transition-transform group-hover:-translate-y-2"
                            spotifyEmbed={
                              msg.spotify_id && (
                                <div className="relative">
                                  <iframe
                                    className="w-full mt-4 rounded-lg"
                                    src={`https://open.spotify.com/embed/track/${msg.spotify_id}`}
                                    width="100%"
                                    height="80"
                                    frameBorder="0"
                                    allow="encrypted-media"
                                    onError={(e) => {
                                      (e.target as HTMLIFrameElement).style.display = 'none';
                                    }}
                                  />
                                  <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center text-sm">
                                    Tidak dapat memuat lagu
                                  </div>
                                </div>
                              )
                            }
                          />
                        </Link>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {isMobile && (
                  <div className="flex justify-center space-x-2 mt-6">
                    {recentlyAddedMessages.map((_, index) => (
                      <motion.div
                        key={index}
                        className={`h-2 w-2 rounded-full ${
                          currentCard === index ? 'bg-gray-900' : 'bg-gray-300'
                        }`}
                        animate={{ scale: currentCard === index ? 1.4 : 1 }}
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