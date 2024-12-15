import { useEffect } from 'react';
import { Block } from '../types/game';
import { PADDLE_HEIGHT, PADDLE_WIDTH, BALL_SIZE, BALL_SPEED } from '../constants/game';

interface GameLogicProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  gameStarted: boolean;
  gameOver: boolean;
  paddleX: number;
  ballX: number;
  ballY: number;
  ballDX: number;
  ballDY: number;
  blocks: Block[];
  setBallX: (x: number | ((prev: number) => number)) => void;
  setBallY: (y: number | ((prev: number) => number)) => void;
  setBallDX: (dx: number | ((prev: number) => number)) => void;
  setBallDY: (dy: number | ((prev: number) => number)) => void;
  setScore: (score: number | ((prev: number) => number)) => void;
  setBlocks: (blocks: Block[] | ((prev: Block[]) => Block[])) => void;
  setGameOver: (gameOver: boolean) => void;
}

export function useGameLogic({
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
  }: GameLogicProps) {
    const INITIAL_SPEED = 2; // Başlangıç hızı
    const SPEED_INCREMENT = 1.05; // Her çarpışmada hız artış katsayısı
    const MAX_SPEED = 8; // Maksimum hız limiti
  
    useEffect(() => {
      if (!gameStarted || gameOver) return;
  
      const canvas = canvasRef.current;
      if (!canvas) return;
  
      let animationFrameId: number;
  
      const gameLoop = () => {
        const nextBallX = ballX + ballDX;
        const nextBallY = ballY + ballDY;
  
        let newBallDX = ballDX;
        let newBallDY = ballDY;
  
        // Duvar çarpışmaları
        if (nextBallX <= 0 || nextBallX >= canvas.width - BALL_SIZE) {
          newBallDX = -ballDX;
          newBallDX = Math.sign(newBallDX) * Math.min(MAX_SPEED, Math.abs(newBallDX * SPEED_INCREMENT));
        }
  
        if (nextBallY <= 0) {
          newBallDY = Math.abs(ballDY);
          newBallDY = Math.sign(newBallDY) * Math.min(MAX_SPEED, Math.abs(newBallDY * SPEED_INCREMENT));
        }
  
        // Raket çarpışması
        if (
          nextBallY >= canvas.height - PADDLE_HEIGHT - BALL_SIZE &&
          nextBallX + BALL_SIZE >= paddleX &&
          nextBallX <= paddleX + PADDLE_WIDTH
        ) {
          const hitPosition = (nextBallX + BALL_SIZE / 2 - paddleX) / PADDLE_WIDTH;
          const angle = (hitPosition - 0.5) * Math.PI / 3; // -60 ile +60 derece
          const speed = Math.sqrt(ballDX * ballDX + ballDY * ballDY);
  
          newBallDX = speed * Math.sin(angle);
          newBallDY = -speed * Math.cos(angle);
  
          // Hızı artır
          const newSpeed = Math.min(MAX_SPEED, speed * SPEED_INCREMENT);
          const normalized = newSpeed / Math.sqrt(newBallDX ** 2 + newBallDY ** 2);
          newBallDX *= normalized;
          newBallDY *= normalized;
        }
  
        // Blok çarpışmaları
        const updatedBlocks = blocks.map((block) => {
          if (!block.isVisible) return block;
  
          const ballLeft = nextBallX;
          const ballRight = nextBallX + BALL_SIZE;
          const ballTop = nextBallY;
          const ballBottom = nextBallY + BALL_SIZE;
  
          if (
            ballRight >= block.x &&
            ballLeft <= block.x + block.width &&
            ballBottom >= block.y &&
            ballTop <= block.y + block.height
          ) {
            const overlapLeft = ballRight - block.x;
            const overlapRight = block.x + block.width - ballLeft;
            const overlapTop = ballBottom - block.y;
            const overlapBottom = block.y + block.height - ballTop;
  
            const minOverlap = Math.min(
              overlapLeft,
              overlapRight,
              overlapTop,
              overlapBottom
            );
  
            if (minOverlap === overlapLeft || minOverlap === overlapRight) {
              newBallDX = -newBallDX;
            } else {
              newBallDY = -newBallDY;
            }
  
            // Blok üzerindeki değeri azalt
            if (block.hits > 1) {
              return { ...block, hits: block.hits - 1 };
            } else {
              // Skoru artır ve bloğu yok et
              setScore((prev) => prev + 10);
              return { ...block, isVisible: false, breaking: true, breakingProgress: 0 };
            }
          }
          return block;
        });
  
        setBlocks(updatedBlocks);
  
        // Oyun bitti kontrolü
        if (nextBallY >= canvas.height) {
          setGameOver(true);
          return;
        }
  
        // Top pozisyonunu güncelle
        setBallX(nextBallX);
        setBallY(nextBallY);
        setBallDX(newBallDX);
        setBallDY(newBallDY);
  
        animationFrameId = requestAnimationFrame(gameLoop);
      };
  
      animationFrameId = requestAnimationFrame(gameLoop);
  
      return () => cancelAnimationFrame(animationFrameId);
    }, [gameStarted, ballX, ballY, ballDX, ballDY, paddleX, gameOver, blocks]);
  }
  