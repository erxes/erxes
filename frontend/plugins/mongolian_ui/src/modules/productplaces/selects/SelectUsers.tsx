import { useMemo } from 'react';
import { gql, useQuery } from '@apollo/client';
import { Select } from 'erxes-ui';

const CLEAR_VALUE = '__clear__';

/* ✅ CORRECT SCHEMA-ALIGNED QUERY */
const USERS_QUERY = gql`
  query users(
    $status: String
    $excludeIds: Boolean
    $ids: [String]
    $isAssignee: Boolean
    $departmentIds: [String]
    $branchIds: [String]
  ) {
    users(
      status: $status
      excludeIds: $excludeIds
      ids: $ids
      isAssignee: $isAssignee
      departmentIds: $departmentIds
      branchIds: $branchIds
    ) {
      list {
        _id
        username
        email
        details {
          fullName
        }
      }
    }
  }
`;

type User = {
  _id: string;
  username?: string;
  email?: string;
  details?: {
    fullName?: string;
  };
};

type Props = {
  value?: string;
  onChange: (userId: string) => void;

  ids?: string[];
  excludeIds?: boolean;
  isAssignee?: boolean;
  branchIds?: string[];
  departmentIds?: string[];

  status?: string;
  disabled?: boolean;
};

export default function SelectUsers({
  value = '',
  onChange,

  ids = [],
  excludeIds = true,
  isAssignee = true,
  branchIds = [],
  departmentIds = [],

  status,
  disabled,
}: Props) {
  const { data, loading } = useQuery(USERS_QUERY, {
    variables: {
      status,
      excludeIds,
      ids,
      isAssignee,
      departmentIds,
      branchIds,
    },
  });

  /* ✅ USERS COME FROM users.list */
  const users: User[] = useMemo(() => data?.users?.list || [], [data]);

  const selectedUser = useMemo(
    () => users.find((u) => u._id === value),
    [users, value],
  );

  const label =
    selectedUser?.details?.fullName ||
    selectedUser?.username ||
    selectedUser?.email ||
    '';

  return (
    <Select
      value={value || ''}
      onValueChange={(v) => onChange(v === CLEAR_VALUE ? '' : v)}
      disabled={disabled || loading}
    >
      <Select.Trigger className="w-full">
        <Select.Value placeholder={loading ? 'Loading...' : 'Choose user'}>
          {value ? label : null}
        </Select.Value>
      </Select.Trigger>

      <Select.Content>
        <Select.Item value={CLEAR_VALUE}>Clear</Select.Item>

        {users.map((u) => {
          const name = u.details?.fullName || u.username || u.email || u._id;

          return (
            <Select.Item key={u._id} value={u._id}>
              {name}
            </Select.Item>
          );
        })}
      </Select.Content>
    </Select>
  );
}
