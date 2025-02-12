"use client";

import { useEffect, useState } from 'react';

export const BackgroundVideo = () => {
  const [isNight, setIsNight] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const currentHour = new Date().getHours();
    setIsNight(currentHour >= 18 || currentHour < 7);
    setMounted(true);
  }, []);

  return (
    <div className="relative w-full h-full rounded-[40px] overflow-hidden border-2 border-white/20 m-4 shadow-2xl">
      {mounted && (
        <video
          key={isNight ? 'night-video' : 'day-video'}
          autoPlay
          loop
          muted
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 min-w-full min-h-full object-cover"
        >
          <source
            src={
              isNight 
                ? 'https://res.cloudinary.com/depbfbxtm/video/upload/v1739168678/Background_Video_Animasi_Awan_Bergerak_eovhes.mp4'
                : 'https://res.cloudinary.com/depbfbxtm/video/upload/v1739169325/Cartoon_Cloud_background___Free_motion_graphics_clouds_overlay___After_Effects_Clouds_animation_sk6kbr.mp4'
            }
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>
      )}
    </div>
  );
};