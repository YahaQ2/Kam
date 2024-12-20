/* eslint-disable @next/next/no-img-element */
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import React, { useState } from "react";

interface CarouselCardProps {
  to: string;
  from: string;
  message: string;
  songTitle?: string;
  artist?: string;
  coverUrl?: string;
}

export const CarouselCard: React.FC<CarouselCardProps> = ({ 
  to, 
  from, 
  message, 
  songTitle, 
  artist, 
  coverUrl 
}) => {
  const [comments, setComments] = useState<string[]>([]);
  const [newComment, setNewComment] = useState("");

  const handleAddComment = () => {
    if (newComment.trim() !== "") {
      setComments([...comments, newComment]);
      setNewComment("");
    }
  };

  return (
    <motion.div
      className="mx-2 my-4"
      whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
    >
      <Card className="w-64 h-auto bg-white shadow-md hover:shadow-lg transition-shadow duration-300">
        <CardContent className="p-8 flex flex-col h-full">
          {/* Header */}
          <div className="space-y-1 mb-6 text-start">
            <p className="text-sm text-gray-500">To: {to}</p>
            <p className="text-sm text-gray-500">From: {from}</p>
          </div>

          {/* Message */}
          <div className="flex-1 flex items-center justify-center">
            <p
              className="text-3xl text-gray-700 font-handwriting text-center leading-relaxed overflow-hidden text-ellipsis line-clamp-3 font-['Reenie_Beanie']"
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
                className="w-16 h-16 object-cover rounded-md" 
              />
              <div className="flex-1 overflow-hidden">
                <p className="font-semibold truncate">{songTitle}</p>
                <p className="text-xs truncate">{artist}</p>
              </div>
            </div>
          )}

          {/* Comments Section */}
          <div className="mt-6">
            <h3 className="text-md font-semibold">Komentar</h3>
            <div className="space-y-2 mt-2">
              {comments.length > 0 ? (
                comments.map((comment, index) => (
                  <div 
                    key={index} 
                    className="bg-gray-100 rounded-md p-2 text-gray-700"
                  >
                    {comment}
                  </div>
                ))
              ) : (
                <p className="text-gray-500">Belum ada komentar untuk pesan ini.</p>
              )}
            </div>
            <div className="mt-4 flex space-x-2">
              <input
                type="text"
                placeholder="Tambahkan komentar..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleAddComment}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              >
                Tambah
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};