/* eslint-disable @next/next/no-img-element */
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect } from "react";

interface CarouselCardProps {
  to: string;
  from: string;
  message: string;
  songTitle?: string;
  artist?: string;
  coverUrl?: string;
  spotifyEmbed?: JSX.Element;
}

export const CarouselCard: React.FC<CarouselCardProps> = ({ 
  to, 
  from, 
  message, 
  songTitle, 
  artist, 
  coverUrl, 
  spotifyEmbed 
}) => {
  // Deteksi kata tidak pantas
  const inappropriateWordsRegex = /fuck|kontol|pantek|pntk|fck|kntl|kampang|jablay|lonte|bangsat|memek/i;
  const hasInappropriateWords = inappropriateWordsRegex.test(message);
  
  // Deteksi kata spesifik unand
  const unandWordsRegex = /unand|yunand|yunend|unend|unands/i;
  const hasUnandWords = unandWordsRegex.test(message);
  
  // Deteksi pesan cinta (hanya jika tidak ada kata tidak pantas)
  const isLoveMessage = !hasInappropriateWords && /love|cinta|sayang|crush/i.test(message);

  return (
    <motion.div
      className="mx-2 my-4"
      whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
    >
      <Card 
        className={`w-72 h-96 shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col relative 
          ${hasInappropriateWords 
            ? "bg-red-100" 
            : isLoveMessage 
              ? "bg-pink-100" 
              : "bg-white"}
        `}
      >
        {/* Background Love */}
        {isLoveMessage && !hasInappropriateWords && (
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-10" 
            style={{ backgroundImage: "url('https://res.cloudinary.com/depbfbxtm/image/upload/v1738829131/dkncarmepvddfdt93cxj.png')" }} 
          />
        )}
        
        {/* Background Unand */}
        {hasUnandWords && !hasInappropriateWords && (
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-10" 
            style={{ backgroundImage: "url('https://res.cloudinary.com/depbfbxtm/image/upload/v1738897074/IMG_20250207_095652_727_gsfzyg.jpg')" }} 
          />
        )}

        <CardContent className="p-6 flex flex-col flex-grow relative">
          {/* Header */}
          <div className="space-y-1 mb-4 text-start">
            <p className="text-sm font-medium text-gray-700">To: {to}</p>
            <p className="text-sm font-medium text-gray-700">From: {from}</p>
          </div>

          {/* Message */}
          <div className="flex-1 flex items-center justify-center overflow-y-auto">
            <p
              className={`text-2xl leading-relaxed text-center px-2 ${
                hasInappropriateWords 
                  ? "text-red-800 font-bold" 
                  : isLoveMessage 
                    ? "text-pink-800" 
                    : hasUnandWords
                    ? "text-green-800"
                    : "text-gray-900"
              }`}
              style={{
                fontFamily: "'Helvetica Neue', sans-serif",
                lineHeight: "1.6",
                wordBreak: "break-word"
              }}
            >
              {message}
            </p>
          </div>

          {/* Song Info */}
          {songTitle && artist && coverUrl && (
            <div className="mt-4 flex items-center space-x-3 text-sm bg-gray-100 p-3 rounded-lg">
              <img 
                src={coverUrl} 
                alt={`${songTitle} cover`} 
                className="w-16 h-16 object-cover rounded-md border-2 border-gray-200" 
              />
              <div className="flex-1 overflow-hidden">
                <p className="font-semibold text-gray-800 truncate">{songTitle}</p>
                <p className="text-xs text-gray-600 truncate">{artist}</p>
              </div>
            </div>
          )}

          {/* Spotify Embed */}
          {spotifyEmbed && <div className="mt-4">{spotifyEmbed}</div>}
        </CardContent>
      </Card>
    </motion.div>
  );
};