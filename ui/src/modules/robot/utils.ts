import { IUser } from 'modules/auth/types';
import { roundToTwo } from 'modules/common/utils';

export const getCurrentUserName = (user: IUser) => {
  if (!user.details) {
    return 'Dear';
  }

  return user.details.shortName || user.details.fullName || '';
};

export const calculatePercentage = (total: number, done: number) => {
  return roundToTwo((done * 100) / total);
};
