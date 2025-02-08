"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/ui/footer";
import { InitialAnimation } from "@/components/initial-animation";
import { Navbar } from "@/components/ui/navbar";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowUpRight } from 'lucide-react';
import { CarouselCard } from "@/components/carousel-card";
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

const DynamicCarousel = dynamic(() => import("@/components/carousel").then((mod) => mod.Carousel), {
  ssr: false,
});

export default function HomePage() {
  const [recentlyAddedMessages, setRecentlyAddedMessages] = useState<Menfess[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [currentCard, setCurrentCard] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
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
            .slice(0, 5);
          
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

  const handleScroll = () => {
    if (containerRef.current) {
      const scrollPosition = containerRef.current.scrollLeft;
      const cardWidth = containerRef.current.offsetWidth;
      setCurrentCard(Math.round(scrollPosition / cardWidth));
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-800">
      <InitialAnimation />
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8 md:py-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 md:mb-6">Menfess Masyarakat Unand</h2>
          
          <div className="flex flex-col items-center gap-4 mb-8">
            <Link
              href="https://forms.zohopublic.com/notnoting12gm1/form/Saran/formperma/8hcRs5pwX77B9AprPeIsvWElcwC1s3JJZlReOgJ3vdc"
              className="inline-flex items-center justify-center px-4 py-2 text-sm md:text-base font-medium text-gray-600 hover:text-gray-800 transition-colors border border-gray-300 rounded-full hover:border-gray-400"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>Kirim Saran/Masukan</span>
              <ArrowUpRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12 md:mb-16">
            <div className="flex flex-col sm:flex-row sm:gap-4 gap-4">
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
            </div>
          </div>

          <div className="relative w-full max-w-7xl mx-auto overflow-hidden mb-16">
            <DynamicCarousel />
          </div>

          <div className="mt-16">
            <h3 className="text-2xl md:text-3xl font-bold mb-8">Menfess Terbaru</h3>
            
            {loading ? (
              <div className="h-40 flex items-center justify-center">Memuat...</div>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : recentlyAddedMessages.length === 0 ? (
              <p>Tidak ada pesan terbaru</p>
            ) : (
              <div className="relative">
                <div 
                  ref={containerRef}
                  className={`flex ${
                    isMobile 
                      ? 'overflow-x-auto snap-x snap-mandatory scrollbar-hide' 
                      : 'overflow-hidden'
                  }`}
                  onScroll={handleScroll}
                >
                  <AnimatePresence initial={false}>
                    {recentlyAddedMessages.map((msg, index) => (
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
                        <Link href={`/message/${msg.id}`}>
                          <CarouselCard 
                            to={msg.recipient} 
                            from={msg.sender} 
                            message={msg.message}
                            songTitle={msg.track?.title}
                            artist={msg.track?.artist}
                            coverUrl={msg.track?.cover_img}
                            spotifyEmbed={
                              msg.spotify_id && (
                                <iframe
                                  className="w-full mt-4 rounded-lg"
                                  src={`https://open.spotify.com/embed/track/${msg.spotify_id}`}
                                  width="100%"
                                  height="80"
                                  frameBorder="0"
                                  allow="encrypted-media"
                                />
                              )
                            }
                          />
                        </Link>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {isMobile && (
                  <div className="flex justify-center space-x-2 mt-4">
                    {recentlyAddedMessages.map((_, index) => (
                      <motion.div
                        key={index}
                        className={`h-2 w-2 rounded-full ${
                          currentCard === index ? 'bg-gray-800' : 'bg-gray-300'
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
        </div>
      </main>
      <Footer />
    </div>
  );
}