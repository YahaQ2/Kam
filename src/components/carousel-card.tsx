// components/carousel-card.tsx
"use client";

import { motion } from "framer-motion";

interface CarouselCardProps {
  to: string;
  from: string;
  message: string;
  songTitle?: string;
  artist?: string;
  coverUrl?: string;
}

export function CarouselCard({
  to,
  from,
  message,
  songTitle,
  artist,
  coverUrl,
}: CarouselCardProps) {
  return (
    <motion.div 
      className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 mx-4"
      whileHover={{ scale: 1.02 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">To: {to}</p>
            <p className="text-sm text-gray-500">From: {from}</p>
          </div>
        </div>

        {/* Message */}
        <p className="text-gray-800 whitespace-pre-line">{message}</p>

        {/* Spotify Track Section */}
        {coverUrl && songTitle && artist && (
          <div className="mt-4 border-t pt-4">
            <div className="flex items-center gap-4">
              {/* Album Cover */}
              <img
                src={coverUrl}
                alt="Album cover"
                className="w-16 h-16 rounded-lg object-cover"
              />

              {/* Track Info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{songTitle}</p>
                <p className="text-sm text-gray-600 truncate">{artist}</p>
              </div>

              {/* Spotify Logo */}
              <svg 
                className="w-8 h-8 text-green-500" 
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.56 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.601-1.559.3z"/>
              </svg>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}