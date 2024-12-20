"use client";

import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { Loader2 } from "lucide-react";

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
  content: string;
  messageId: number;
};

export default function MessagePage() {
  const router = useRouter();
  const params = useParams();
  const [message, setMessage] = useState<MessageType | null>(null);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch message data
  useEffect(() => {
    const fetchMessage = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `https://unand.vercel.app/v1/api/menfess-spotify-search/${params.id}`
        );
        const text = await response.text();
        const data = JSON.parse(text);

        if (data && data.status && data.data && data.data.length > 0) {
          setMessage(data.data[0]);
        } else {
          console.error("Failed to fetch message:", data.message);
          setMessage(null);
        }
      } catch (error) {
        console.error("Error fetching message:", error);
        setMessage(null);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchComments = async () => {
      try {
        const response = await fetch(
          `https://unand.vercel.app/v1/api/menfess-spotify?comment=${params.id}`
        );
        if (response.ok) {
          const data = await response.json();
          setComments(data);
        } else {
          console.error("Failed to fetch comments:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };

    fetchMessage();
    fetchComments();
  }, [params.id]);

  // Handle adding a comment
  const handleAddComment = async () => {
    if (newComment.trim()) {
      try {
        const response = await fetch("https://unand.vercel.app/v1/api/menfess-spotify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messageId: Number(params.id),
            content: newComment,
          }),
        });

        if (response.ok) {
          const savedComment = await response.json();
          setComments([...comments, savedComment]); // Update comments state
          setNewComment(""); // Clear the input
        } else {
          console.error("Failed to save comment:", response.statusText);
        }
      } catch (error) {
        console.error("Error saving comment:", error);
      }
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

  const formattedDate = dayjs
    .utc(message.created_at)
    .tz("Asia/Jakarta")
    .format("DD MMM YYYY, HH:mm");

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
            <div className="mb-6">
              <p className="text-sm text-gray-500">To: {message.recipient}</p>
              <p className="text-sm text-gray-500">From: {message.sender}</p>
            </div>
            <div className="border-t border-b border-gray-200 py-6">
              <p className="font-['Reenie_Beanie'] leading-relaxed text-4xl">
                {message.message}
              </p>
              {message.track?.spotify_embed_link && (
                <iframe
                  key={message.track.spotify_embed_link}
                  src={message.track.spotify_embed_link}
                  width="100%"
                  height="352"
                  allowFullScreen
                  allow="encrypted-media"
                  className="rounded-lg mt-6"
                />
              )}
            </div>
            <div className="mt-4 text-right">
              <p className="text-sm text-gray-500">Sent on: {formattedDate}</p>
            </div>
            {/* Komentar Section */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-800">Komentar</h3>
              <div className="mt-4 space-y-4">
                {comments.length > 0 ? (
                  comments.map((comment, index) => (
                    <div
                      key={index}
                      className="bg-gray-100 p-4 rounded-lg shadow-sm text-gray-800"
                    >
                      <p>{comment.content}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">Belum ada komentar.</p>
                )}
              </div>
              <div className="mt-6">
                <textarea
                  className="w-full border rounded-lg p-3 text-gray-800 focus:outline-none focus:ring"
                  placeholder="Tambahkan komentar..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <button
                  onClick={handleAddComment}
                  className="mt-3 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                >
                  Tambah Komentar
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}