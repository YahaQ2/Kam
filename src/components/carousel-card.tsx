import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

interface CarouselCardProps {
  to: string;
  from: string;
  message: string;
}

export const CarouselCard: React.FC<CarouselCardProps> = ({ to, from, message }) => {
  return (
    <motion.div
      className="mx-2 my-4"
      whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
    >
      <Card className="w-64 h-80 bg-white shadow-md hover:shadow-lg transition-shadow duration-300">
        <CardContent className="p-8 flex flex-col h-full">
          {/* Header */}
          <div className="space-y-1 mb-6">
            <p className="text-sm text-gray-500">To: {to}</p>
            <p className="text-sm text-gray-500">From: {from}</p>
          </div>

          {/* Message - Centered */}
          <div className="flex-1 flex items-center justify-center">
            <p
              className="text-lg font-handwriting text-center leading-relaxed overflow-hidden text-ellipsis whitespace-nowrap"
              title={message} // Menambahkan tooltip untuk teks penuh
            >
              {message}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
