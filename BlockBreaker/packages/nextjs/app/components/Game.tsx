"use client"
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Block } from '../types/game';
import { connectWallet } from '../utils/wallet';
import GameHeader from './GameHeader';
import { useGameRenderer } from '../hooks/useGameRenderer';
import { useGameLogic } from '../hooks/useGameLogic';
import {
  PADDLE_HEIGHT,
  PADDLE_WIDTH,
  BALL_SIZE,
  BLOCK_SIZE,
  BALL_SPEED,
} from '../constants/game';

export default function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [paddleX, setPaddleX] = useState(0);
  const [ballX, setBallX] = useState(0);
  const [ballY, setBallY] = useState(0);
  const [ballDX, setBallDX] = useState(BALL_SPEED);
  const [ballDY, setBallDY] = useState(-BALL_SPEED);
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  // Oyunu başlat
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    
    // Raket pozisyonunu başlat
    setPaddleX((canvas.width - PADDLE_WIDTH) / 2);
    
    // Top pozisyonunu başlat
    setBallX(canvas.width / 2);
    setBallY(canvas.height - PADDLE_HEIGHT - BALL_SIZE);

    // Blokları oluştur
    const newBlocks: Block[] = [];
    const BLOCK_ROWS = 5;
    const BLOCK_COLS = Math.floor((canvas.width - 40) / (BLOCK_SIZE + 10));
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD'];

    for (let row = 0; row < BLOCK_ROWS; row++) {
      for (let col = 0; col < BLOCK_COLS; col++) {
        newBlocks.push({
          x: col * (BLOCK_SIZE + 10) + 20,
          y: row * (BLOCK_SIZE + 10) + 50,
          width: BLOCK_SIZE,
          height: BLOCK_SIZE,
          color: colors[row],
          isVisible: true,
          hits: Math.floor(Math.random() * 3) + 1,
        });
      }
    }
    setBlocks(newBlocks);
  }, []);

  // Oyun mantığını ve çizim işlemlerini hooks'lardan al
  useGameLogic({
    canvasRef,
    gameStarted,
    gameOver,
    paddleX,
    ballX,
    ballY,
    ballDX,
    ballDY,
    blocks,
    setBallX,
    setBallY,
    setBallDX,
    setBallDY,
    setScore,
    setBlocks,
    setGameOver,
  });

  useGameRenderer({
    canvasRef,
    blocks,
    paddleX,
    ballX,
    ballY,
    score,
    gameStarted,
    gameOver,
    isWalletConnected,
  });

  // Fare hareketi kontrolü
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    setPaddleX(Math.min(Math.max(0, x - PADDLE_WIDTH / 2), canvas.width - PADDLE_WIDTH));
  };

  // Cüzdan bağlantısı
  const handleConnectWallet = async () => {
    if (!isWalletConnected) {
      const connected = await connectWallet();
      setIsWalletConnected(connected);
      if (connected) {
        toast.success('Cüzdan başarıyla bağlandı!');
      }
    }
  };

  // Oyunu başlat/yeniden başlat
  const handleStartGame = () => {
    if (gameOver) {
      setGameOver(false);
      setScore(0);
      setBallX(canvasRef.current!.width / 2);
      setBallY(canvasRef.current!.height - PADDLE_HEIGHT - BALL_SIZE);
      setBallDX(BALL_SPEED);
      setBallDY(-BALL_SPEED);
      setBlocks(prev => prev.map(block => ({
        ...block,
        isVisible: true,
        hits: Math.floor(Math.random() * 3) + 1,
      })));
    }
    setGameStarted(true);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 p-8">
      <GameHeader
        score={score}
        isWalletConnected={isWalletConnected}
        onConnectWallet={handleConnectWallet}
      />
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={600}
          height={500}
          className="bg-white shadow-xl rounded-lg"
          onMouseMove={handleMouseMove}
          onClick={handleStartGame}
        />
        {!gameStarted && !gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
            <button
              onClick={handleStartGame}
              className="px-6 py-3 bg-green-500 text-white rounded-lg text-xl font-bold hover:bg-green-600 transition-colors"
            >
              Oyunu Başlat
            </button>
          </div>
        )}
      </div>
      <div className="mt-6 text-gray-700 text-center max-w-md">
        <p className="text-lg font-medium mb-2">Nasıl Oynanır?</p>
        <p className="mb-2">🖱️ Raketi hareket ettirmek için farenizi kullanın</p>
        <p className="mb-2">🎯 Her blok üzerindeki sayı, kırılması için gereken vuruş sayısını gösterir</p>
        <p>💰 İsterseniz MetaMask cüzdanınızı bağlayabilirsiniz</p>
      </div>
    </div>
    );
}