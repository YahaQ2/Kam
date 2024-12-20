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

export default function MessagePage() {
  const router = useRouter();
  const params = useParams();
  const [message, setMessage] = useState<MessageType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [comments, setComments] = useState<string[]>([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    const fetchMessage = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`https://unand.vercel.app/v1/api/menfess-spotify-search/${params.id}`);
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

    fetchMessage();
  }, [params.id]);

  const handleAddComment = () => {
    if (newComment.trim() !== "") {
      setComments([...comments, newComment]);
      setNewComment("");
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
          </div>

          {/* Comment Section */}
          <div className="p-8 border-t">
            <h3 className="text-lg font-medium mb-4">Komentar</h3>
            <div className="space-y-3 mb-4">
              {comments.length > 0 ? (
                comments.map((comment, index) => (
                  <div
                    key={index}
                    className="bg-gray-100 text-gray-800 rounded-lg px-4 py-2 shadow-sm"
                  >
                    {comment}
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">Belum ada komentar untuk pesan ini.</p>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Tambahkan komentar..."
                className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-gray-400"
              />
              <button
                onClick={handleAddComment}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-greyy-600 transition"
              >
                Tambah
              </button>
              
              const handleAddComment = async () => {
  if (newComment.trim() !== "") {
    try {
      // Kirim komentar ke server
      const response = await fetch("https://unand.vercel.app/v1/api/menfess", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message_id: params.id, // ID pesan
          comment: newComment,  // Isi komentar
        }),
      });

      const result = await response.json();

      if (response.ok) {
        // Tambahkan komentar ke daftar jika berhasil
        setComments([...comments, newComment]);
        setNewComment("");
      } else {
        console.error("Failed to add comment:", result.message);
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  }
};
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}