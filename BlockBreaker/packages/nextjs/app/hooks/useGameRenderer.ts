import { useEffect } from 'react';
import { Block } from '../types/game';
import { PADDLE_HEIGHT, PADDLE_WIDTH, BALL_SIZE } from '../constants/game';

interface GameRendererProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  blocks: Block[];
  paddleX: number;
  ballX: number;
  ballY: number;
  score: number;
  gameStarted: boolean;
  gameOver: boolean;
  isWalletConnected: boolean;
}

export function useGameRenderer({
  canvasRef,
  blocks,
  paddleX,
  ballX,
  ballY,
  score,
  gameStarted,
  gameOver,
}: GameRendererProps) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Kanvası temizle
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Blokları çiz
    blocks.forEach(block => {
      if (block.isVisible) {
        ctx.save();
        
        if (block.breaking) {
          // Kırılma animasyonu
          const progress = block.breakingProgress || 0;
          const scale = 1 + progress * 0.2;
          const alpha = 1 - progress;
          
          ctx.globalAlpha = alpha;
          ctx.translate(block.x + block.width/2, block.y + block.height/2);
          ctx.scale(scale, scale);
          ctx.translate(-(block.x + block.width/2), -(block.y + block.height/2));
        }

        // Blok gölgesi
        ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetY = 2;

        // Blok arkaplanı
        ctx.fillStyle = block.color;
        ctx.fillRect(block.x, block.y, block.width, block.height);
        
        // Vuruş sayısı
        if (!block.breaking) {
          ctx.shadowColor = 'transparent';
          ctx.fillStyle = '#333';
          ctx.font = 'bold 20px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(
            block.hits.toString(),
            block.x + block.width / 2,
            block.y + block.height / 2 + 8
          );
        }
        
        ctx.restore();
      }
    });

    // Raket gölgesi ve gradyanı
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 4;

    const gradient = ctx.createLinearGradient(
      paddleX,
      canvas.height - PADDLE_HEIGHT,
      paddleX + PADDLE_WIDTH,
      canvas.height
    );
    gradient.addColorStop(0, '#4F46E5');
    gradient.addColorStop(1, '#7C3AED');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(paddleX, canvas.height - PADDLE_HEIGHT, PADDLE_WIDTH, PADDLE_HEIGHT);
    ctx.restore();

    // Top gölgesi ve gradyanı
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 2;

    const ballGradient = ctx.createRadialGradient(
      ballX, ballY, 0,
      ballX, ballY, BALL_SIZE/2
    );
    ballGradient.addColorStop(0, '#60A5FA');
    ballGradient.addColorStop(1, '#3B82F6');

    ctx.fillStyle = ballGradient;
    ctx.beginPath();
    ctx.arc(ballX, ballY, BALL_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Oyun bitti mesajı
    if (gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 40px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Oyun Bitti!', canvas.width / 2, canvas.height / 2);
      ctx.font = '24px Arial';
      ctx.fillText(`Final Skor: ${score}`, canvas.width / 2, canvas.height / 2 + 40);
      ctx.fillText('Tekrar oynamak için tıkla', canvas.width / 2, canvas.height / 2 + 80);
    }
  }, [blocks, paddleX, ballX, ballY, score, gameStarted, gameOver]);
}