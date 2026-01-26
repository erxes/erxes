import { useMemo } from 'react';
import { gql, useQuery } from '@apollo/client';
import { Select } from 'erxes-ui';

const CLEAR_VALUE = '__clear__';

const USERS_QUERY = gql`
  query users(
    $page: Int
    $perPage: Int
    $status: String
    $excludeIds: Boolean
    $searchValue: String
    $isActive: Boolean
    $ids: [String]
    $brandIds: [String]
    $departmentId: String
    $unitId: String
    $isAssignee: Boolean
    $branchId: String
    $departmentIds: [String]
    $branchIds: [String]
    $segment: String
    $segmentData: String
  ) {
    users(
      page: $page
      perPage: $perPage
      status: $status
      excludeIds: $excludeIds
      searchValue: $searchValue
      isActive: $isActive
      ids: $ids
      brandIds: $brandIds
      departmentId: $departmentId
      unitId: $unitId
      branchId: $branchId
      isAssignee: $isAssignee
      departmentIds: $departmentIds
      branchIds: $branchIds
      segment: $segment
      segmentData: $segmentData
    ) {
      _id
      username
      email
      details {
        fullName
        __typename
      }
    }
  }
`;

type User = {
  _id: string;
  username?: string;
  email?: string;
  details?: { fullName?: string };
};

type Props = {
  value?: string;
  onChange: (userId: string) => void;

  ids?: string[];
  excludeIds?: boolean;
  isAssignee?: boolean;
  branchIds?: string[];

  page?: number;
  perPage?: number;
  status?: string;
  searchValue?: string;
  isActive?: boolean;

  departmentId?: string;
  unitId?: string;
  branchId?: string;
  departmentIds?: string[];
  brandIds?: string[];
  segment?: string;
  segmentData?: string;

  disabled?: boolean;
};

export default function SelectUsers({
  value = '',
  onChange,

  ids = [],
  excludeIds = true,
  isAssignee = true,
  branchIds = [],

  page = 1,
  perPage = 50,

  status,
  searchValue,
  isActive,

  departmentId,
  unitId,
  branchId,
  departmentIds,
  brandIds,
  segment,
  segmentData,

  disabled,
}: Props) {
  const { data, loading } = useQuery(USERS_QUERY, {
    variables: {
      page,
      perPage,
      status,
      excludeIds,
      searchValue,
      isActive,
      ids,
      brandIds,
      departmentId,
      unitId,
      branchId,
      isAssignee,
      departmentIds,
      branchIds,
      segment,
      segmentData,
    },
  });

  const users: User[] = useMemo(() => data?.users || [], [data]);

  const selectedUser = useMemo(() => {
    if (!value) return null;
    return users.find((u) => u._id === value) || null;
  }, [users, value]);

  const selectedLabel =
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
        <Select.Value
          placeholder={loading ? 'Loading...' : 'Choose user'}
        >
          {value ? selectedLabel : null}
        </Select.Value>
      </Select.Trigger>

      <Select.Content>
        <Select.Item value={CLEAR_VALUE}>Clear user</Select.Item>

        {users.map((u) => {
          const label = u.details?.fullName || u.username || u.email || u._id;

          return (
            <Select.Item key={u._id} value={u._id}>
              {label}
            </Select.Item>
          );
        })}
      </Select.Content>
    </Select>
  );
}
