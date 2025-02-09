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
        className={`w-64 h-96 shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col relative 
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

        <CardContent className="p-8 flex flex-col h-full">
          {/* Header */}
          <div className="space-y-1 mb-6 text-start">
            <p className="text-sm text-gray-500">To: {to}</p>
            <p className="text-sm text-gray-500">From: {from}</p>
          </div>

          {/* Message */}
          <div className="flex-1 flex items-center justify-center">
            <p
              className={`text-3xl text-gray-700 font-handwriting text-center leading-relaxed overflow-hidden text-ellipsis line-clamp-3 font-['Reenie_Beanie'] 
                ${hasInappropriateWords 
                  ? "text-red-800 font-bold" 
                  : isLoveMessage 
                    ? "text-pink-800" 
                    : hasUnandWords
                    ? "text-green-800"
                    : "text-gray-900"
                }`}
              title={message}
            >
              {message}
            </p>
          </div>

          {/* Song Info */}
          {songTitle && artist && coverUrl && (
            <div className="mt-4 flex items-center space-x-3 text-sm text-gray-600">
              <img 
                src={coverUrl} 
                alt={`${songTitle} cover`} 
                className="w-16 h-16 object-cover rounded-md border-2 border-gray-200" 
              />
              <div className="flex-1 overflow-hidden">
                <p className="font-semibold truncate">{songTitle}</p>
                <p className="text-xs truncate">{artist}</p>
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