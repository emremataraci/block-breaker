"use client"
import React, { useEffect, useRef, useState } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';

interface Block {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  isVisible: boolean;
  hits: number;
}

const PADDLE_HEIGHT = 10;
const PADDLE_WIDTH = 100;
const BALL_SIZE = 10;
const BLOCK_WIDTH = 60;
const BLOCK_HEIGHT = 20;
const BALL_SPEED = 5;

const MONAD_CHAIN_ID = '31337';
const MONAD_NETWORK = {
  chainId: MONAD_CHAIN_ID,
  chainName: 'Monad',
  nativeCurrency: {
    name: 'MON',
    symbol: 'MON',
    decimals: 18,
  },
  rpcUrls: ['http://localhost:8545'],
  blockExplorerUrls: ['http://localhost:8545'],
};

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

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      toast.error('Please install MetaMask!');
      return;
    }
  
    try {
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
  
      // Check if the network is already Monad
      const currentChainId = await window.ethereum.request({
        method: 'eth_chainId',
      });
  
      if (currentChainId !== MONAD_CHAIN_ID) {
        // If the current network is not Monad, attempt to switch
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: MONAD_CHAIN_ID }],
          });
          toast.success('Switched to Monad network');
        } catch (switchError: any) {
          // This error code indicates that the chain has not been added to MetaMask
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [MONAD_NETWORK],
              });
              toast.success('Monad network added');
            } catch (addError) {
              console.error('Error adding Monad network:', addError);
              toast.error('Failed to add Monad network');
              return;
            }
          } else {
            console.error('Error switching to Monad network:', switchError);
            toast.error('Failed to switch to Monad network');
            return;
          }
        }
      } else {
        // If the current network is Monad, just set the connection status
        setIsWalletConnected(true);
        toast.success('Already connected to Monad network!');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast.error('Failed to connect wallet');
    }
  };
  

  // Initialize game
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initialize paddle position
    setPaddleX((canvas.width - PADDLE_WIDTH) / 2);
    
    // Initialize ball position
    setBallX(canvas.width / 2);
    setBallY(canvas.height - PADDLE_HEIGHT - BALL_SIZE);

    // Create blocks
    const newBlocks: Block[] = [];
    const BLOCK_ROWS = 5;
    const BLOCK_COLS = Math.floor((canvas.width - 40) / (BLOCK_WIDTH + 10));
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD'];

    for (let row = 0; row < BLOCK_ROWS; row++) {
      for (let col = 0; col < BLOCK_COLS; col++) {
        newBlocks.push({
          x: col * (BLOCK_WIDTH + 10) + 20,
          y: row * (BLOCK_HEIGHT + 10) + 50,
          width: BLOCK_WIDTH,
          height: BLOCK_HEIGHT,
          color: colors[row],
          isVisible: true,
          hits: Math.floor(Math.random() * 3) + 1, // Random number between 1-3
        });
      }
    }
    setBlocks(newBlocks);
  }, []);

  // Game loop
  useEffect(() => {
    if (!gameStarted || gameOver || !isWalletConnected) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gameLoop = setInterval(() => {
      // Move ball
      setBallX(prev => prev + ballDX);
      setBallY(prev => prev + ballDY);

      // Ball collision with walls
      if (ballX <= 0 || ballX >= canvas.width - BALL_SIZE) {
        setBallDX(prev => -prev);
      }
      if (ballY <= 0) {
        setBallDY(prev => -prev);
      }

      // Ball collision with paddle
      if (
        ballY >= canvas.height - PADDLE_HEIGHT - BALL_SIZE &&
        ballX >= paddleX &&
        ballX <= paddleX + PADDLE_WIDTH
      ) {
        setBallDY(-BALL_SPEED);
        // Adjust ball direction based on where it hits the paddle
        const hitPosition = (ballX - paddleX) / PADDLE_WIDTH;
        setBallDX(BALL_SPEED * (hitPosition - 0.5) * 2);
      }

      // Game over condition
      if (ballY >= canvas.height) {
        setGameOver(true);
        clearInterval(gameLoop);
      }

      // Check collision with blocks
      setBlocks(prevBlocks => {
        let modified = false;
        const newBlocks = prevBlocks.map(block => {
          if (!block.isVisible) return block;

          if (
            ballX >= block.x &&
            ballX <= block.x + block.width &&
            ballY >= block.y &&
            ballY <= block.y + block.height
          ) {
            setBallDY(prev => -prev);
            modified = true;

            if (block.hits === 1) {
              setScore(prev => prev + 10);
              return { ...block, isVisible: false };
            } else {
              return { ...block, hits: block.hits - 1 };
            }
          }
          return block;
        });

        return modified ? newBlocks : prevBlocks;
      });
    }, 1000 / 60);

    return () => clearInterval(gameLoop);
  }, [gameStarted, ballDX, ballDY, paddleX, gameOver, isWalletConnected]);

  // Draw game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw blocks
    blocks.forEach(block => {
      if (block.isVisible) {
        ctx.fillStyle = block.color;
        ctx.fillRect(block.x, block.y, block.width, block.height);
        
        // Draw hit count
        ctx.fillStyle = '#333';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(
          block.hits.toString(),
          block.x + block.width / 2,
          block.y + block.height / 2 + 6
        );
      }
    });

    // Draw paddle
    ctx.fillStyle = '#333';
    ctx.fillRect(paddleX, canvas.height - PADDLE_HEIGHT, PADDLE_WIDTH, PADDLE_HEIGHT);

    // Draw ball
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(ballX, ballY, BALL_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();

    // Draw score
    ctx.fillStyle = '#333';
    ctx.font = '20px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${score}`, 10, 30);

    // Draw game over
    if (gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#fff';
      ctx.font = '40px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2);
      ctx.font = '20px Arial';
      ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2 + 40);
      ctx.fillText('Click to play again', canvas.width / 2, canvas.height / 2 + 80);
    }

    // Draw connect wallet or start message
    if (!gameStarted && !gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#fff';
      ctx.font = '30px Arial';
      ctx.textAlign = 'center';
      if (!isWalletConnected) {
        ctx.fillText('Connect Wallet to Play', canvas.width / 2, canvas.height / 2);
      } else {
        ctx.fillText('Click to Start', canvas.width / 2, canvas.height / 2);
      }
    }
  }, [blocks, paddleX, ballX, ballY, score, gameStarted, gameOver, isWalletConnected]);

  // Handle mouse movement
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    setPaddleX(Math.min(Math.max(0, x - PADDLE_WIDTH / 2), canvas.width - PADDLE_WIDTH));
  };

  // Handle canvas click
  const handleClick = () => {
    if (!isWalletConnected) {
      connectWallet();
      return;
    }

    if (gameOver) {
      // Reset game
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-8">
      <canvas
        ref={canvasRef}
        width={600}
        height={500}
        className="bg-white shadow-lg rounded-lg"
        onMouseMove={handleMouseMove}
        onClick={handleClick}
      />
      <div className="mt-4 text-gray-700 text-center">
        <p className="mb-2">Use your mouse to move the paddle and break all the blocks!</p>
        <p>Each block shows the number of hits needed to break it.</p>
      </div>
    </div>
  );
}