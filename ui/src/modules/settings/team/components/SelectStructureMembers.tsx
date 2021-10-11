import gql from 'graphql-tag';
import { IUser } from 'modules/auth/types';
import { __ } from 'modules/common/utils';
import React, { useEffect, useState } from 'react';
import { useQuery } from 'react-apollo';
import Select from 'react-select-plus';

import { queries } from '../graphql';

type Props = {
  onSelect: (value: string[] | string) => void;
  value?: string | string[];
  multi?: boolean;
  excludeUserIds: string[];
  objectId: string;
  name: string;
  isAllUsers?: boolean;
};

export default function SelectStructureMembers({
  objectId,
  onSelect,
  multi,
  value,
  excludeUserIds,
  name,
  isAllUsers
}: Props) {
  const queryName = isAllUsers ? 'allUsers' : 'noDepartmentUsers';
  const variables = isAllUsers ? {} : { excludeId: objectId };

  const { loading, data } = useQuery(gql(queries[queryName]), {
    variables,
    fetchPolicy: 'network-only'
  });
  const [users, setUsers] = useState([] as IUser[]);

  useEffect(() => {
    if (!loading) {
      const filteredUsers = data[queryName].filter(
        u => !excludeUserIds.includes(u._id)
      );

      setUsers(filteredUsers);
    }
  }, [excludeUserIds, data, loading, queryName]);

  return (
    <Select
      name={name}
      multi={multi}
      label={__('Choose team members')}
      value={value}
      onChange={onSelect}
      options={users.map(user => ({
        value: user._id,
        label: (user.details && user.details.fullName) || user.email,
        avatar: (user.details && user.details.avatar) || ''
      }))}
    />
  );
}
