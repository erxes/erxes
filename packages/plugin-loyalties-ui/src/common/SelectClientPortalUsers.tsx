import React from 'react';
import { SelectWithSearch } from '@erxes/ui/src/components';
import { IOption } from '@erxes/ui/src/types';

type Props = {
  label: string;
  name: string;
  initialValue?: any;
  onSelect: (value: string | string[], name: string) => void;
  customOption?: {
    value: string;
    label: string;
    avatar?: string;
  };
  multi?: boolean;
};

const listParamsDef = `
  $page: Int,
  $perPage: Int,
  $type: String,
  $ids: [String],
  $excludeIds: Boolean,
  $searchValue: String,
  $sortField: String,
  $sortDirection: Int,
  $cpId: String,
  $dateFilters: String,
`;

const listParamsValue = `
  page: $page,
  perPage: $perPage,
  type: $type,
  ids: $ids,
  excludeIds: $excludeIds,
  searchValue: $searchValue,
  sortField: $sortField,
  sortDirection: $sortDirection,
  cpId: $cpId,
  dateFilters: $dateFilters,
`;

const clientPortalUsersQuery = `
  query clientPortalUsers(${listParamsDef}) {
    clientPortalUsers(${listParamsValue}) {
        _id
        firstName,
        lastName,
        username,
        email,avatar
    }
  }
`;

type CpUserType = {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  avatar: string;
};

class SelectClientPortalUser extends React.Component<Props> {
  render() {
    const {
      label,
      name,
      initialValue,
      onSelect,
      multi,
      customOption
    } = this.props;

    function generateCPUserOptions(array: CpUserType[] = []): IOption[] {
      return array.map(item => {
        const user = item || ({} as CpUserType);

        let label =
          user?.firstName && user?.lastName
            ? `${user?.firstName} ${user?.lastName}`
            : user?.username || user?.email || '';

        return {
          value: user._id,
          label: label,
          avatar: user.avatar
        };
      });
    }

    return (
      <SelectWithSearch
        label={label}
        queryName="clientPortalUsers"
        name={name}
        initialValue={initialValue}
        generateOptions={generateCPUserOptions}
        onSelect={onSelect}
        customQuery={clientPortalUsersQuery}
        customOption={customOption}
        multi={multi}
      />
    );
  }
}

export default SelectClientPortalUser;
