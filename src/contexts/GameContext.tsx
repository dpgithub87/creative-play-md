import { createContext, useContext, useState, ReactNode } from "react";
import { GameResult } from "@/components/GameOutput";

interface GameContextType {
  pendingGame: GameResult | null;
  setPendingGame: (game: GameResult | null) => void;
}

const GameContext = createContext<GameContextType>({ pendingGame: null, setPendingGame: () => {} });

export const useGame = () => useContext(GameContext);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [pendingGame, setPendingGame] = useState<GameResult | null>(null);

  return (
    <GameContext.Provider value={{ pendingGame, setPendingGame }}>
      {children}
    </GameContext.Provider>
  );
};
