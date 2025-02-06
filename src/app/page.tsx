import { useEffect, useState } from "react";
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
}

export default function HomePage() {
  const [recentlyAddedMessages, setRecentlyAddedMessages] = useState<Menfess[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`https://unand.vercel.app/v1/api/menfess-spotify-search`);
        if (!response.ok) {
          throw new Error("Failed to fetch messages.");
        }
        
        const responseData = await response.json();
        
        if (responseData.status && Array.isArray(responseData.data)) {
          const messagesWithTracks = await Promise.all(responseData.data.map(async (menfess) => {
            if (menfess.spotify_id) {
              const trackResponse = await fetch(`https://api.spotify.com/v1/tracks/${menfess.spotify_id}`, {
                headers: {
                  'Authorization': 'Bearer YOUR_SPOTIFY_ACCESS_TOKEN'
                }
              });
              if (trackResponse.ok) {
                const trackData = await trackResponse.json();
                menfess.track = {
                  title: trackData.name,
                  artist: trackData.artists.map((artist: any) => artist.name).join(', '),
                  cover_img: trackData.album.images[0].url,
                  preview_link: trackData.preview_url,
                  spotify_embed_link: `https://open.spotify.com/embed/track/${menfess.spotify_id}`,
                  external_link: trackData.external_urls.spotify
                };
              }
            }
            return menfess;
          }));

          const sortedMessages = messagesWithTracks
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 5);
          
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

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-800">
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8 md:py-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 md:mb-6">Menfess Masyarakat unand</h2>
          <div className="mt-16">
            <h3 className="text-2xl md:text-3xl font-bold mb-8">Menfess Terbaru</h3>
            {loading ? (
              <p>Loading...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : recentlyAddedMessages.length === 0 ? (
              <p>No recent messages found.</p>
            ) : (
              <div className="relative">
                <div className="flex justify-center gap-4">
                  {recentlyAddedMessages.map((msg) => (
                    <motion.div 
                      key={msg.id} 
                      className="flex-shrink-0"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <CarouselCard 
                        to={msg.recipient} 
                        from={msg.sender} 
                        message={msg.message}
                        songTitle={msg.track?.title}
                        artist={msg.track?.artist}
                        coverUrl={msg.track?.cover_img}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}