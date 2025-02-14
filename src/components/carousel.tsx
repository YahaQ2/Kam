"use client";

import { useState, useLayoutEffect, useEffect, useRef } from "react";
import { motion, useAnimation, useMotionValue } from "framer-motion";
import { TickerCard } from "./ticket-card"; // Ensure this component is implemented to display individual messages

export const Carousel: React.FC = () => {
  const [messages, setMessages] = useState([]); // State to store messages from the database
  const [width, setWidth] = useState(0);
  const carousel = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const controls = useAnimation();

  // Fetch messages from the database
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch("https://your-api-endpoint.com/messages"); // Replace with your API endpoint
        if (!response.ok) {
          throw new Error("Failed to fetch messages");
        }
        const data = await response.json();
        setMessages(data); // Assuming the API returns an array of messages
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, []);

  // Calculate the width of the carousel
  useLayoutEffect(() => {
    if (carousel.current) {
      setWidth(carousel.current.scrollWidth - carousel.current.offsetWidth);
    }
  }, [messages]); // Recalculate when messages are updated

  // Infinite scrolling animation
  useLayoutEffect(() => {
    let isMounted = true;
    let animationFrame: number;

    const scrollAnimation = async () => {
      if (!isMounted) return;

      await controls.start({
        x: -width,
        transition: {
          duration: 100,
          ease: "linear",
        },
      });

      if (isMounted) {
        controls.set({ x: 0 }); // Reset x position
        animationFrame = requestAnimationFrame(scrollAnimation);
      }
    };

    scrollAnimation();

    return () => {
      isMounted = false;
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
      controls.stop();
    };
  }, [controls, width]);

  // Repeat messages to create a seamless scroll effect
  const repeatedMessages = [...messages, ...messages, ...messages];

  return (
    <div className="relative w-full max-w-7xl mx-auto">
      {/* Gradient overlays for better visibility */}
      <div className="absolute left-0 top-0 w-32 h-full bg-gradient-to-r from-white via-white to-transparent z-10" />
      <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-white via-white to-transparent z-10" />

      <motion.div
        ref={carousel}
        className="cursor-grab overflow-hidden"
        whileTap={{ cursor: "grabbing" }}
      >
        <motion.div
          className="flex space-x-4 py-4"
          style={{ x }}
          animate={controls}
        >
          {repeatedMessages.map((msg, index) => (
            <motion.div
              key={`${msg.to}-${index}`}
              className="flex-none"
            >
              <TickerCard {...msg} />
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};