// Oyun sabitleri
export const PADDLE_HEIGHT = 15;
export const PADDLE_WIDTH = 100;
export const BALL_SIZE = 10;
export const BLOCK_SIZE = 50; // Kare bloklar için
export const BALL_SPEED = 2.3;

// Monad ağ ayarları
export const MONAD_CHAIN_ID = '31337';
export const MONAD_NETWORK = {
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