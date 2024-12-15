import { toast } from 'react-hot-toast';
import { MONAD_CHAIN_ID, MONAD_NETWORK } from '../constants/game';
import { ethers } from 'ethers';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export const connectWallet = async (): Promise<boolean> => {
  if (typeof window.ethereum === 'undefined') {
    toast.error('Lütfen MetaMask yükleyin!');
    return false;
  }

  try {
    // MetaMask hesabına erişim iste
    await window.ethereum.request({ method: 'eth_requestAccounts' });

    // Monad ağına geçiş yap veya ekle
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: MONAD_CHAIN_ID }],
      });
    } catch (switchError: any) {
      // Ağ henüz eklenmemişse
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [MONAD_NETWORK],
          });
          
          // Ağ eklendikten sonra tekrar geçiş dene
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: MONAD_CHAIN_ID }],
          });
        } catch (addError) {
          console.error('Monad ağı eklenirken hata:', addError);
          toast.error('Monad ağı eklenemedi');
          return false;
        }
      } else {
        console.error('Monad ağına geçiş hatası:', switchError);
        toast.error('Monad ağına geçilemedi');
        return false;
      }
    }

    toast.success('Monad ağına bağlandı!');
    return true;
  } catch (error) {
    console.error('Cüzdan bağlantı hatası:', error);
    toast.error('Cüzdan bağlanamadı');
    return false;
  }
};

export const getProvider = () => {
  // Monad ağına bağlanmak için RPC URL'ini kullanarak sağlayıcıyı oluşturun
  const provider = new ethers.JsonRpcProvider('http://localhost:8545');
  return provider;
};

export const getSigner = async (provider: ethers.JsonRpcProvider) => {
  const signer = provider.getSigner();
  return signer;
};
