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

// ... (tipe data MessageType dan CommentType tetap sama)

export default function MessagePage() {
  // ... (state dan hooks tetap sama)

  useEffect(() => {
    const fetchMessage = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`https://unand.vercel.app/v1/api/menfess-spotify-search/${params.id}`);
        
        if (!response.ok) { // Tambahkan pengecekan status response
          throw new Error('Failed to fetch message');
        }
        
        const data = await response.json(); // Langsung parse JSON
        
        if (data?.status && data.data) {
          setMessage(data.data); // Ambil objek langsung, bukan array
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
      
      // Pastikan struktur respons sesuai, misal: newCommentData.data
      setComments(prev => [...prev, newCommentData.data]); 
      setNewComment('');
      setCommentUser('');
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  // ... (bagian rendering tetap sama)
}