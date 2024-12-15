import React from 'react';
import { Wallet2 } from 'lucide-react';

interface GameHeaderProps {
  score: number;
  isWalletConnected: boolean;
  onConnectWallet: () => void;
}

export default function GameHeader({ score, isWalletConnected, onConnectWallet }: GameHeaderProps) {
  return (
    <div className="flex justify-between items-center w-full max-w-[600px] mb-4 px-4">
      <div className="text-2xl font-bold text-gray-800">Skor: {score}</div>
      <button
        onClick={onConnectWallet}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
          isWalletConnected
            ? 'bg-green-500 text-white'
            : 'bg-blue-500 hover:bg-blue-600 text-white'
        }`}
      >
        <Wallet2 size={20} />
        {isWalletConnected ? 'Bağlandı' : 'Cüzdanı Bağla'}
      </button>
    </div>
    );
  }