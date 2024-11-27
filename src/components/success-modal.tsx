import React from 'react'
import { Button } from "@/components/ui/button"

interface SuccessModalProps {
  isOpen: boolean
  onClose: () => void
}

export const SuccessModal: React.FC<SuccessModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full" role="dialog" aria-modal="true">
        <h2 className="text-2xl font-bold mb-4">Yeay!</h2>
        <p className="mb-6">Pesanmu terkirim. Semoga sampai di dia yaaa</p>
        <Button onClick={onClose} className="w-full bg-gray-800 text-white hover:bg-gray-900">
          Tutup
        </Button>
      </div>
    </div>
  )
}

