import { useLocation } from 'react-router';
import { LotteryPath } from '~/modules/loyalties/lotteries/types/path/Lottery';
import { LOTTERY_CURSOR_SESSION_KEY } from '../constants/lotteryCursorSessionKey';

export const useLotteryLeadSessionKey = () => {
  const { pathname } = useLocation();

  const isLottery = pathname.includes(LotteryPath.Index);

  return {
    isLottery,
    sessionKey: LOTTERY_CURSOR_SESSION_KEY,
  };
};
