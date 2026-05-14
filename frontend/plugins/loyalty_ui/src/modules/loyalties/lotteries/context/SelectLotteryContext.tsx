import { createContext, useContext } from 'react';
import { ILottery } from '../types/lottery';

export type ISelectLotteryContext = {
  lotteryIds: string[];
  lotteries: ILottery[];
  setLotteries: (lotteries: ILottery[]) => void;
  onSelect: (lottery: ILottery) => void;
  loading: boolean;
  error: string | null;
};

export const SelectLotteryContext = createContext<ISelectLotteryContext | null>(
  null,
);

export const useSelectLotteryContext = () => {
  const context = useContext(SelectLotteryContext);
  if (!context) {
    throw new Error(
      'useSelectLotteryContext must be used within a SelectLotteryProvider',
    );
  }
  return context;
};
