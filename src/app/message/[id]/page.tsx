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
  author: string;
  content: string;
  created_at: string;
};

export default function MessagePage() {
  const router = useRouter();
  const params = useParams();
  const [message, setMessage] = useState<MessageType | null>(null);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch message
        const messageRes = await fetch(`https://unand.vercel.app/v1/api/menfess-spotify-search/${params.id}`);
        const messageData = await messageRes.json();
        
        if (messageData?.status) {
          setMessage(messageData.data[0]);
          // Fetch comments
          const commentsRes = await fetch(`/api/comments?messageId=${params.id}`);
          const commentsData = await commentsRes.json();
          setComments(commentsData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchData();
  }, [params.id]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setCommentLoading(true);
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageId: params.id,
          content: newComment,
          author: 'Anonymous',
        }),
      });

      if (res.ok) {
        const newCommentData = await res.json();
        setComments([...comments, newCommentData]);
        setNewComment('');
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setCommentLoading(false);
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
            {/* Existing message content... */}

            {/* Comments Section */}
            <div className="mt-12">
              <h3 className="text-lg font-semibold mb-6">Comments ({comments.length})</h3>
              
              <form onSubmit={handleCommentSubmit} className="mb-8">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="w-full p-3 border rounded-lg mb-2 resize-none"
                  rows={3}
                />
                <Button
                  type="submit"
                  disabled={commentLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {commentLoading ? 'Posting...' : 'Post Comment'}
                </Button>
              </form>

              <div className="space-y-6">
                {comments.map((comment) => (
                  <div key={comment.id} className="border-l-4 border-blue-200 pl-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium">{comment.author}</span>
                      <span className="text-sm text-gray-500">
                        {dayjs(comment.created_at).format('DD MMM YYYY, HH:mm')}
                      </span>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}