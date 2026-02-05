import { useMemo } from 'react';
import { gql, useQuery } from '@apollo/client';
import { Select } from 'erxes-ui';

const CLEAR_VALUE = '__clear__';

const BRANCHES_QUERY = gql`
  query branches(
    $ids: [String]
    $excludeIds: Boolean
    $searchValue: String
    $status: String
    $withoutUserFilter: Boolean
  ) {
    branches(
      ids: $ids
      excludeIds: $excludeIds
      searchValue: $searchValue
      status: $status
      withoutUserFilter: $withoutUserFilter
    ) {
      _id
      title
    }
  }
`;

type Branch = {
  _id: string;
  title: string;
};

type Props = {
  value?: string;
  onChange: (branchId: string) => void;

  ids?: string[];
  excludeIds?: boolean;
  searchValue?: string;
  status?: string;
  withoutUserFilter?: boolean;

  disabled?: boolean;
};

export default function SelectBranches({
  value = '',
  onChange,
  ids = [],
  excludeIds,
  searchValue,
  status,
  withoutUserFilter,
  disabled,
}: Props) {
  const { data, loading } = useQuery(BRANCHES_QUERY, {
    variables: {
      ids,
      excludeIds,
      searchValue,
      status,
      withoutUserFilter,
    },
  });

  const branches: Branch[] = useMemo(() => data?.branches || [], [data]);

  return (
    <Select
      value={value || ''}
      onValueChange={(v) => onChange(v === CLEAR_VALUE ? '' : v)}
      disabled={disabled}
    >
      <Select.Trigger className="w-full">
        <Select.Value placeholder={loading ? 'Loading...' : 'Choose branch'} />
      </Select.Trigger>

      <Select.Content>
        <Select.Item value={CLEAR_VALUE}>Clear branch</Select.Item>

        {branches.map((b) => (
          <Select.Item key={b._id} value={b._id}>
            {b.title}
          </Select.Item>
        ))}
      </Select.Content>
    </Select>
  );
}
