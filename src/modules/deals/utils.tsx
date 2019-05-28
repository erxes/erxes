import { Tip } from 'modules/common/components';
import { DealDate } from 'modules/deals/styles/deal';
import * as moment from 'moment';
import * as React from 'react';
import { IUser, IUserDetails } from '../auth/types';

type Options = {
  _id: string;
  name?: string;
  type?: string;
  index?: number;
  itemId?: string;
};

// get options for react-select-plus
export function selectOptions(array: Options[] = []) {
  return array.map(item => ({ value: item._id, label: item.name }));
}

// get config options for react-select-plus
export function selectConfigOptions(array: string[] = [], CONSTANT: any) {
  return array.map(item => ({
    value: item,
    label: CONSTANT.find(el => el.value === item).label
  }));
}

// get user options for react-select-plus
export function selectUserOptions(array: IUser[] = []) {
  return array.map(item => {
    const user = item || ({} as IUser);
    const details = item.details || ({} as IUserDetails);

    return {
      value: user._id,
      label: details.fullName || user.email,
      avatar: details.avatar
    };
  });
}

export const renderDealDate = (date, format = 'YYYY-MM-DD') => {
  if (!date) {
    return null;
  }

  return (
    <Tip text={moment(date).format(format)}>
      <DealDate>{moment(date).format('lll')}</DealDate>
    </Tip>
  );
};

export const invalidateCalendarCache = () => {
  localStorage.setItem('dealCalendarCacheInvalidated', 'true');
};
