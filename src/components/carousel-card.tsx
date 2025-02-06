// components/carousel-card.tsx
import React from 'react';

interface CarouselCardProps {
  to: string;
  from: string;
  message: string;
  track?: {
    title: string;
    artist: string;
    cover_img: string;
    preview_link: string | null;
    spotify_embed_link: string;
    external_link: string;
  };
}

const CarouselCard: React.FC<CarouselCardProps> = ({ to, from, message, track }) => {
  return (
    <div className="p-4 bg-white shadow-md rounded-lg">
      <h3 className="text-xl font-bold mb-2">To: {to}</h3>
      <h4 className="text-lg font-semibold mb-2">From: {from}</h4>
      <p className="text-gray-700 mb-4">{message}</p>
      {track && (
        <div className="mt-4">
          <h5 className="text-lg font-semibold mb-2">Song Details</h5>
          <div className="flex items-center">
            {track.cover_img && (
              <img src={track.cover_img} alt={track.title} className="w-16 h-16 mr-4 rounded" />
            )}
            <div>
              <p className="text-gray-800">{track.title}</p>
              <p className="text-gray-600">{track.artist}</p>
              {track.preview_link && (
                <a href={track.preview_link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                  Preview
                </a>
              )}
              {track.spotify_embed_link && (
                <a href={track.spotify_embed_link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                  Spotify Embed
                </a>
              )}
              {track.external_link && (
                <a href={track.external_link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                  External Link
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarouselCard;