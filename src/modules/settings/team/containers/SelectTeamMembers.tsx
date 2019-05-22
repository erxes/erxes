import { IUser, IUserDetails } from 'modules/auth/types';
import { SelectWithSearch } from 'modules/common/components';
import { IOption, IQueryParams } from 'modules/common/types';
import * as React from 'react';
import { queries } from '../graphql';

// get user options for react-select-plus
export function generateUserOptions(array: IUser[] = []): IOption[] {
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
  value,
  multi = true,
  label,
  name
}: {
  queryParams?: IQueryParams;
  label: string;
  onSelect: (value: string[] | string, name: string) => void;
  multi?: boolean;
  customOption?: IOption;
  value?: string | string[];
  name: string;
}) => {
  const defaultValue = queryParams ? queryParams[name] : value;

  return (
    <SelectWithSearch
      label={label}
      queryName="users"
      name={name}
      values={
        typeof defaultValue === 'string'
          ? multi
            ? [defaultValue]
            : defaultValue
          : defaultValue
      }
      generateOptions={generateUserOptions}
      onSelect={onSelect}
      customQuery={queries.users}
      customOption={customOption}
      multi={multi}
    />
  );
};
