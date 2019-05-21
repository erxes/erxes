import { IUser, IUserDetails } from 'modules/auth/types';
import { SelectWithSearch } from 'modules/common/components';
import { IQueryParams, Option } from 'modules/common/types';
import * as React from 'react';
import { queries } from '../graphql';

// get user options for react-select-plus
export function selectUserOptions(array: IUser[] = []): Option[] {
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

export default ({
  queryParams,
  onSelect,
  customOption,
  setParam = true,
  value,
  multi = true,
  label
}: {
  queryParams: IQueryParams;
  label: string;
  onSelect: (value: string, name: string) => void;
  multi?: boolean;
  customOption?: Option;
  value?: string;
  setParam?: boolean;
}) => {
  const name = 'assignedUserIds';
  const defaultValue = setParam ? queryParams[name] : value;

  return (
    <SelectWithSearch
      label={label}
      queryName="users"
      name={name}
      value={defaultValue}
      options={selectUserOptions}
      onSelect={onSelect}
      customQuery={queries.users}
      customOption={customOption}
      multi={multi}
    />
  );
};
