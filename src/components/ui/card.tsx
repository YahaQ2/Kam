import React, { useState } from "react";
import { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from "./Card";

interface CommentCardProps {
  title: string;
  description?: string;
  message: string;
}

const CommentCard: React.FC<CommentCardProps> = ({ title, description, message }) => {
  const [comments, setComments] = useState<string[]>([]);
  const [newComment, setNewComment] = useState("");

  const handleAddComment = () => {
    if (newComment.trim() !== "") {
      setComments([...comments, newComment]);
      setNewComment("");
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      {/* Header */}
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>

      {/* Content */}
      <CardContent>
        <p className="text-gray-700">{message}</p>
      </CardContent>

      {/* Comments */}
      <CardContent className="border-t mt-4">
        <h3 className="text-lg font-medium mb-3">Komentar</h3>
        <div className="space-y-3">
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
        <div className="mt-4 flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Tambahkan komentar..."
            className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-400"
          />
          <button
            onClick={handleAddComment}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
          >
            Tambah
          </button>
        </div>
      </CardContent>

      {/* Footer */}
      <CardFooter className="justify-end">
        <p className="text-sm text-gray-500">Terima kasih atas komentarnya!</p>
      </CardFooter>
    </Card>
  );
};

export default CommentCard;