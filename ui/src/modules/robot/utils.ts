import { IUser } from 'modules/auth/types';
import { roundToTwo, __ } from 'modules/common/utils';

type Options = {
  _id: string;
  name?: any;
};

export function selectOptions(array: Options[] = []) {
  return array.map(item => ({ value: item._id, label: __(item.name) }));
}

export const getCurrentUserName = (user: IUser) => {
  if (!user.details) {
    return 'Dear';
  }

  return user.details.shortName || user.details.fullName || '';
};

export const calculatePercentage = (total: number, done: number) => {
  if (total > 0) {
    return roundToTwo((done * 100) / total);
  }

  return 0;
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
