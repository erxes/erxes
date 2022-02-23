import { IUser, IUserDetails } from '@erxes/ui/src/auth/types';

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
