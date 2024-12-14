import { defineChain } from "viem"

console.log("NEXT_PUBLIC_RPCURL_MONAD:", process.env.NEXT_PUBLIC_RPCURL_MONAD)
//Monad chain
export const monad = defineChain({
  id: 31337,
  name: "Monad",
  nativeCurrency: { name: "Monad", symbol: "MON", decimals: 18 },
  rpcUrls: {
    default: {
      http: [`${process.env.NEXT_PUBLIC_RPCURL_MONAD}`],
    },
  },
  blockExplorers: {
    default: {
      name: "Monad Explorer",
      url: "http://localhost:8548",
    },
  },
})