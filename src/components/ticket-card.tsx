import React, { useState } from 'react';

interface TickerCardProps {
  message: string;
}

export const TickerCard: React.FC<TickerCardProps> = ({ message }) => {
  const [comments, setComments] = useState<string[]>([]);
  const [newComment, setNewComment] = useState('');

  const handleAddComment = () => {
    if (newComment.trim() !== '') {
      setComments([...comments, newComment]);
      setNewComment('');
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 w-800">
      <div className="mb-4">
        <p className="text-2xl text-gray-700 truncate font-['Reenie_Beanie']">{message}</p>
      </div>
      <div className="mt-4">
        <h3 className="text-lg font-semibold">Komentar</h3>
        <div className="space-y-2 mt-2">
          {comments.length > 0 ? (
            comments.map((comment, index) => (
              <div
                key={index}
                className="bg-gray-100 rounded-md p-2 text-gray-700"
              >
                {comment}
              </div>
            ))
          ) : (
            <p className="text-gray-500">Belum ada komentar untuk pesan ini.</p>
          )}
        </div>
        <div className="mt-4 flex space-x-2">
          <input
            type="text"
            placeholder="Tambahkan komentar..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleAddComment}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Tambah
          </button>
        </div>
      </div>
    </div>
  );
};