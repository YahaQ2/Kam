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
import { motion } from "framer-motion";

interface TrackData {
  title: string;
  artist: string;
  cover_img: string;
  preview_link: string | null;
  spotify_embed_link: string;
  external_link: string;
}

interface Menfess {
  id: number;
  sender: string;
  recipient: string;
  message: string;
  spotify_id?: string;
  track?: TrackData;
  created_at: string;
}

interface MenfessResponse {
  status: boolean;
  data: Menfess[];
}

const DynamicCarousel = dynamic(() => import("@/components/carousel").then((mod) => mod.Carousel), {
  ssr: false,
  loading: () => <div className="w-full h-64 bg-gray-100 animate-pulse rounded-lg" />
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
        const response = await fetch(`/api/menfess`);
        if (!response.ok) throw new Error("Gagal memuat pesan");
        
        const { data }: MenfessResponse = await response.json();
        
        const sortedMessages = data
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5);

        setRecentlyAddedMessages(sortedMessages);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan tidak diketahui");
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

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-800">
      <InitialAnimation />
      <Navbar />
      
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8 md:py-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 md:mb-6">Menfess Masyarakat unand</h2>
          
          <Link
            href="https://forms.zohopublic.com/notnoting12gm1/form/Saran/formperma/8hcRs5pwX77B9AprPeIsvWElcwC1s3JJZlReOgJ3vdc"
            className="inline-flex items-center justify-center px-4 py-2 mb-8 text-sm md:text-base font-medium text-gray-600 hover:text-gray-800 transition-colors border border-gray-300 rounded-full hover:border-gray-400"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>saran/masukan/fitur baru</span>
            <ArrowUpRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
          </Link>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12 md:mb-16">
            <Button asChild className="bg-gray-800 text-white hover:bg-gray-900">
              <Link href="/message">Kirim Menfess</Link>
            </Button>
            <Button asChild variant="outline" className="text-gray-800 hover:bg-gray-100">
              <Link href="/search-message">Explore Menfess</Link>
            </Button>
          </div>

          <div className="relative w-full max-w-7xl mx-auto overflow-hidden mb-16">
            <DynamicCarousel />
          </div>

          <div className="mt-16">
            <h3 className="text-2xl md:text-3xl font-bold mb-8">Menfess Terbaru</h3>
            
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-lg" />
                ))}
              </div>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : recentlyAddedMessages.length === 0 ? (
              <p>Tidak ada menfess terbaru</p>
            ) : (
              <div className="relative">
                <div 
                  ref={containerRef}
                  className={`${isMobile ? 
                    'flex overflow-x-auto snap-x snap-mandatory scrollbar-hide' : 
                    'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'}`
                  }
                  onScroll={handleScroll}
                >
                  {recentlyAddedMessages.map((msg) => (
                    <div 
                      key={msg.id} 
                      className={isMobile ? 'flex-shrink-0 w-full snap-center' : ''}
                    >
                      <Link href={`/message/${msg.id}`} className="block h-full">
                        <CarouselCard 
                          to={msg.recipient} 
                          from={msg.sender} 
                          message={msg.message}
                          songTitle={msg.track?.title || ''}
                          artist={msg.track?.artist || ''}
                          coverUrl={msg.track?.cover_img || ''}
                        />
                      </Link>
                    </div>
                  ))}
                </div>

                {isMobile && (
                  <div className="flex justify-center space-x-2 mt-4">
                    {recentlyAddedMessages.map((_, index) => (
                      <motion.div
                        key={index}
                        className={`h-2 w-2 rounded-full ${currentCard === index ? 'bg-gray-800' : 'bg-gray-300'}`}
                        animate={{ scale: currentCard === index ? 1.2 : 1 }}
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