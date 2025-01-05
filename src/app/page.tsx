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
    preview_link: string | null;
    spotify_embed_link: string;
    external_link: string;
  };
  song?: {
    title: string;
    artist: string;
    coverUrl: string;
  };
  created_at: string;
  updated_at?: string | null;
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
  const [showPopup, setShowPopup] = useState(true); // State untuk popup
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`https://unand.vercel.app/v1/api/menfess-spotify-search`);
        if (!response.ok) {
          throw new Error("Failed to fetch messages.");
        }
        
        const responseData: MenfessResponse = await response.json();
        
        if (responseData.status && Array.isArray(responseData.data)) {
          const sortedMessages = responseData.data
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 5)
            .map(menfess => ({
              ...menfess,
              track: menfess.track ? {
                title: menfess.track.title,
                artist: menfess.track.artist,
                cover_img: menfess.track.cover_img,
                preview_link: menfess.track.preview_link || null, 
                spotify_embed_link: menfess.track.spotify_embed_link,
                external_link: menfess.track.external_link,
              } : undefined
            }));
          
          setRecentlyAddedMessages(sortedMessages);
        } else {
          throw new Error("Invalid data format.");
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred.");
        }
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
      const newCard = Math.round(scrollPosition / cardWidth);
      setCurrentCard(newCard);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-800">
      <InitialAnimation />
      <Navbar />
      <main className="flex-grow">
        {/* Popup Peringatan */}
        {showPopup && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <p className="text-lg font-semibold">Hai Semangat!</p>
              <button
                onClick={() => setShowPopup(false)}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Konten Utama */}
        <div className="container mx-auto px-4 py-8 md:py-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 md:mb-6">Menfess Masyarakat unand</h2>
          {/* ...sisa kode Anda... */}
        </div>
      </main>
      <Footer />
    </div>
  );
}