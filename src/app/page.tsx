"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/ui/footer";
import { InitialAnimation } from "@/components/initial-animation";
import { Navbar } from "@/components/ui/navbar";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowUpRight } from "lucide-react";
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
  created_at: string;
  updated_at?: string | null;
}

interface MenfessResponse {
  status: boolean;
  success: boolean;
  message: string | null;
  data: Menfess[];
}

const DynamicCarousel = dynamic(
  () => import("@/components/carousel").then((mod) => mod.Carousel),
  { ssr: false }
);

export default function HomePage() {
  const [recentlyAddedMessages, setRecentlyAddedMessages] = useState<Menfess[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [currentCard, setCurrentCard] = useState(0);
  const [isPopupVisible, setIsPopupVisible] = useState(false); // State untuk popup
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
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
            .map((menfess) => ({
              ...menfess,
              track: menfess.track
                ? {
                    title: menfess.track.title,
                    artist: menfess.track.artist,
                    cover_img: menfess.track.cover_img,
                    preview_link: menfess.track.preview_link || null,
                    spotify_embed_link: menfess.track.spotify_embed_link,
                    external_link: menfess.track.external_link,
                  }
                : undefined,
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
        <div className="container mx-auto px-4 py-8 md:py-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 md:mb-6">Menfess Masyarakat Unand</h2>
          <button
            onClick={() => setIsPopupVisible(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
          >
            Tampilkan Pesan
          </button>

          {isPopupVisible && (
            <div className="overlay fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50">
              <div className="popup bg-white rounded-lg p-6 shadow-lg text-center">
                <h2 className="text-xl font-bold mb-4">Pesan Popup</h2>
                <p className="mb-4">Ini adalah pesan popup yang bisa ditutup.</p>
                <button
                  onClick={() => setIsPopupVisible(false)}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                >
                  Tutup
                </button>
              </div>
            </div>
          )}

          <Link
            href="https://forms.zohopublic.com/notnoting12gm1/form/Saran/formperma/8hcRs5pwX77B9AprPeIsvWElcwC1s3JJZlReOgJ3vdc"
            className="inline-flex items-center justify-center px-4 py-2 mb-8 text-sm md:text-base font-medium text-gray-600 hover:text-gray-800 transition-colors border border-gray-300 rounded-full hover:border-gray-400"
          >
            <span>Saran/Masukan/Fitur Baru</span>
            <ArrowUpRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}