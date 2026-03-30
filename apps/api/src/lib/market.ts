import type { Market, Position } from "@prisma/client";

export function calculateMarketSummary(market: Market, positions: Position[]) {
  const yesVolume = positions
    .filter((position) => position.side === "YES")
    .reduce((total, position) => total + position.amount, 0);
  const noVolume = positions
    .filter((position) => position.side === "NO")
    .reduce((total, position) => total + position.amount, 0);
  const totalVolume = yesVolume + noVolume;
  const yesPrice =
    totalVolume === 0 ? 0.5 : Number((yesVolume / totalVolume).toFixed(2));

  return {
    yesVolume,
    noVolume,
    totalVolume,
    yesPrice,
    noPrice: Number((1 - yesPrice).toFixed(2))
  };
}
