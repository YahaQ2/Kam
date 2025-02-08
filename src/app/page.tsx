"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/ui/footer";
import { InitialAnimation } from "@/components/initial-animation";
import { Navbar } from "@/components/ui/navbar";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowUpRight, Sparkles, Heart, MessageCircle } from 'lucide-react';
import { CarouselCard } from "@/components/carousel-card";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";

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
});

export default function HomePage() {
  const [recentlyAddedMessages, setRecentlyAddedMessages] = useState<Menfess[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  const staggerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.2,
        duration: 0.5,
        ease: "easeOut"
      }
    })
  };

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
        if (!response.ok) throw new Error("Gagal memuat pesan");
        
        const responseData: MenfessResponse = await response.json();
        
        if (responseData.status && Array.isArray(responseData.data)) {
          const sortedMessages = responseData.data
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 6);
          
          setRecentlyAddedMessages(sortedMessages);
        } else {
          throw new Error("Format data tidak valid");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      } finally {
        setLoading(false);
      }
    };
  
    fetchMessages();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-indigo-50 text-gray-800">
      <InitialAnimation />
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-24 pb-16 md:py-32">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="mb-8">
                <Sparkles className="h-16 w-16 text-amber-400 mx-auto animate-pulse" />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">
                Menfess Masyarakat Unand
              </h1>
              <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-12">
                Sampaikan perasaanmu dengan cara yang kreatif dan berkesan melalui pesan dan musik
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
                className="group relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Link href="/message">
                  <span className="relative z-10 flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Kirim Menfess
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Link>
              </Button>

              <Button
                asChild
                className="group relative overflow-hidden bg-white border-2 border-indigo-600 text-indigo-600 px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Link href="/search-message">
                  <span className="relative z-10 flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Jelajahi Menfess
                  </span>
                  <div className="absolute inset-0 bg-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Featured Section */}
        <section className="relative py-16 md:py-24 bg-gradient-to-br from-indigo-50 to-white">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
                Menfess Terpopuler
              </h2>
              <p className="text-gray-600 max-w-xl mx-auto">
                Lihat pesan-pesan penuh makna yang paling banyak disukai masyarakat
              </p>
            </motion.div>

            <div className="relative max-w-7xl mx-auto rounded-3xl overflow-hidden shadow-2xl">
              <DynamicCarousel />
            </div>
          </div>
        </section>

        {/* Recent Menfess Section */}
        <section className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
                Menfess Terbaru
              </h2>
              <p className="text-gray-600 max-w-xl mx-auto">
                Pesan-pesan terbaru yang penuh kejutan dan makna
              </p>
            </motion.div>

            {loading ? (
              <div className="h-96 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent" />
              </div>
            ) : error ? (
              <div className="text-center py-12 bg-red-50 rounded-xl">
                <p className="text-red-600 flex items-center justify-center gap-2">
                  <span className="text-xl">⚠️</span>
                  {error}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {recentlyAddedMessages.map((msg, index) => (
                  <motion.div
                    key={msg.id}
                    variants={staggerVariants}
                    initial="hidden"
                    animate="visible"
                    custom={index}
                    className="group"
                  >
                    <Link href={`/message/${msg.id}`}>
                      <div className="h-full bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 overflow-hidden">
                        <CarouselCard 
                          to={msg.recipient} 
                          from={msg.sender} 
                          message={msg.message}
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
                        <div className="p-4 bg-gray-50 border-t">
                          <p className="text-sm text-gray-500">
                            {new Date(msg.created_at).toLocaleDateString('id-ID', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-16 md:py-24 bg-gradient-to-br from-indigo-600 to-purple-600">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-white"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Sudah sampaikan perasaanmu hari ini?
              </h2>
              <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
                Jangan biarkan momen berharga berlalu begitu saja. Bagikan ceritamu sekarang!
              </p>
              <div className="flex justify-center gap-4">
                <Button
                  asChild
                  className="bg-white text-indigo-600 px-8 py-4 rounded-xl hover:bg-gray-100 hover:text-indigo-700 transition-colors shadow-lg"
                >
                  <Link href="/message">Mulai Menfess</Link>
                </Button>
                <Button
                  asChild
                  className="border-2 border-white text-white px-8 py-4 rounded-xl hover:bg-white/10 transition-colors shadow-lg"
                >
                  <Link href="/search-message">Lihat Contoh</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}