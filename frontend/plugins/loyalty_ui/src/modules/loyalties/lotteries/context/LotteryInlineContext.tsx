import { createContext, useContext } from 'react';
import { ILottery } from '../types/lottery';

export interface ILotteryInlineContext {
  lotteries: ILottery[];
  loading: boolean;
  lotteryIds?: string[];
  placeholder: string;
  updateLottery?: (lotteries: ILottery[]) => void;
}

export const LotteryInlineContext = createContext<ILotteryInlineContext | null>(
  null,
);

export const useLotteryInlineContext = () => {
  const context = useContext(LotteryInlineContext);
  if (!context) {
    throw new Error(
      'useLotteryInlineContext must be used within a LotteryInlineProvider',
    );
  }
  return context;
};
