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

export const orderArray = (array, order) => {
  array.sort((a, b) => {
    const A = a.name;
    const B = b.name;

    if (order.indexOf(A) > order.indexOf(B)) {
      return 1;
    } else {
      return -1;
    }
  });

  return array;
};
