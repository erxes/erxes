import { IUser, IUserDetails } from 'modules/auth/types';
import { SelectWithSearch } from 'modules/common/components';
import { Option } from 'modules/common/types';
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

export default ({ queryParams, onSelect, customOption }) => (
  <SelectWithSearch
    label="Choose team members"
    queryName="users"
    name="assignedUserIds"
    customQuery={queries.users}
    value={queryParams.assignedUserIds}
    options={selectUserOptions}
    onSelect={onSelect}
    customOption={customOption}
  />
);
