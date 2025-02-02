"use client";

import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { Loader2 } from 'lucide-react';

dayjs.extend(utc);
dayjs.extend(timezone);

type MessageType = {
  id: number;
  sender: string;
  recipient: string;
  message: string;
  track?: {
    spotify_embed_link?: string;
  };
  created_at: string;
};

type CommentType = {
  id: number;
  user: string;
  text: string;
  created_at: string;
};

export default function MessagePage() {
  const router = useRouter();
  const params = useParams();
  const [message, setMessage] = useState<MessageType | null>(null);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [commentUser, setCommentUser] = useState('');

  useEffect(() => {
    const fetchMessage = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`https://unand.vercel.app/v1/api/menfess-spotify-search/${params.id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch message');
        }
        
        const data = await response.json();
        
        if (data?.status && data.data) {
          setMessage(data.data); // Asumsi data.data adalah objek tunggal
        } else {
          setMessage(null);
        }
      } catch (error) {
        console.error('Error fetching message:', error);
        setMessage(null);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchComments = async () => {
      setCommentLoading(true);
      try {
        const response = await fetch(`https://unand.vercel.app/v1/api/comments/${params.id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch comments');
        }
        
        const data = await response.json();
        setComments(data.data || []);
      } catch (error) {
        console.error('Error fetching comments:', error);
        setComments([]);
      } finally {
        setCommentLoading(false);
      }
    };

    fetchMessage();
    fetchComments();
  }, [params.id]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !commentUser.trim()) return;

    try {
      const response = await fetch(`https://unand.vercel.app/v1/api/comments/${params.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: commentUser,
          text: newComment,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to post comment');
      }

      const newCommentData = await response.json();
      
      // Asumsi respons memiliki struktur { data: CommentType }
      setComments(prev => [...prev, newCommentData.data]);
      setNewComment('');
      setCommentUser('');
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!message) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl font-semibold text-gray-600">Message not found</p>
      </div>
    );
  }

  const formattedDate = dayjs.utc(message.created_at).tz("Asia/Jakarta").format("DD MMM YYYY, HH:mm");

  return (
    <div className="min-h-screen bg-white text-gray-800 flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-32">
        <Button
          onClick={() => router.back()}
          className="mb-8 bg-gray-800 text-white hover:bg-gray-900"
        >
          Back
        </Button>
        <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold mb-2">Message Details</h1>
              <p className="text-gray-700 mb-4">{message.message}</p>
              {message.track?.spotify_embed_link && (
                <iframe
                  src={message.track.spotify_embed_link}
                  width="100%"
                  height="80"
                  frameBorder="0"
                  allow="encrypted-media"
                  className="mb-4"
                ></iframe>
              )}
              <p className="text-sm text-gray-500">Sent on: {formattedDate}</p>
            </div>

            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4">Komentar ({comments.length})</h3>
              {commentLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="mb-4 p-4 border rounded-lg bg-gray-50">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-medium text-sm text-gray-700">{comment.user}</p>
                      <p className="text-xs text-gray-500">
                        {dayjs.utc(comment.created_at).tz("Asia/Jakarta").format("DD MMM YYYY, HH:mm")}
                      </p>
                    </div>
                    <p className="text-gray-900">{comment.text}</p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleSubmitComment} className="mt-6">
              <input
                type="text"
                value={commentUser}
                onChange={(e) => setCommentUser(e.target.value)}
                className="w-full p-2 border rounded-lg mb-2"
                placeholder="Nama Anda"
                required
              />
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full p-2 border rounded-lg mb-2"
                placeholder="Tulis komentar..."
                rows={3}
                required
              />
              <Button 
                type="submit" 
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                Kirim Komentar
              </Button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}