"use client";

import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { useEffect, useState } from "react";

const mockMessages = [
  { id: 1, sender: "Alice", recipient: "Bob", message: "Hey Bob, how are you?" },
  { id: 2, sender: "Bob", recipient: "Alice", message: "Hi Alice, I'm good! How about you?" },
  { id: 3, sender: "Charlie", recipient: "David", message: "David, don't forget our meeting tomorrow." },
  { id: 4, sender: "David", recipient: "Charlie", message: "Thanks for the reminder, Charlie!" },
];

export default function MessagePage() {
  const router = useRouter();
  const params = useParams();
  const [message, setMessage] = useState<typeof mockMessages[0] | null>(null);

  useEffect(() => {
    // Find message client-side
    const foundMessage = mockMessages.find(
      (msg) => msg.id === parseInt(params.id as string)
    );
    setMessage(foundMessage || null);
  }, [params.id]);

  if (!message) {
    return <div>Message not found</div>;
  }

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
              <p className="text-lg font-handwriting leading-relaxed">
                {message.message}
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}