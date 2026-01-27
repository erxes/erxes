import { useMemo } from 'react';
import { gql, useQuery } from '@apollo/client';
import { Select } from 'erxes-ui';

const CLEAR_VALUE = '__clear__';

const DEPARTMENTS_QUERY = gql`
  query departments(
    $ids: [String]
    $excludeIds: Boolean
    $searchValue: String
    $status: String
    $withoutUserFilter: Boolean
  ) {
    departments(
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

type Department = {
  _id: string;
  title: string;
};

type Props = {
  value?: string;
  onChange: (departmentId: string) => void;

  ids?: string[];
  excludeIds?: boolean;
  searchValue?: string;
  status?: string;
  withoutUserFilter?: boolean;

  disabled?: boolean;
};

export default function SelectDepartments({
  value = '',
  onChange,
  ids = [],
  excludeIds,
  searchValue,
  status,
  withoutUserFilter,
  disabled,
}: Props) {
  const { data, loading } = useQuery(DEPARTMENTS_QUERY, {
    variables: {
      ids,
      excludeIds,
      searchValue,
      status,
      withoutUserFilter,
    },
  });

  const departments: Department[] = useMemo(
    () => data?.departments || [],
    [data],
  );

  return (
    <Select
      value={value || ''}
      onValueChange={(v) => onChange(v === CLEAR_VALUE ? '' : v)}
      disabled={disabled}
    >
      <Select.Trigger className="w-full">
        <Select.Value placeholder={loading ? 'Loading...' : 'Choose department'} />
      </Select.Trigger>

      <Select.Content>
        <Select.Item value={CLEAR_VALUE}>Clear department</Select.Item>

        {departments.map((d) => (
          <Select.Item key={d._id} value={d._id}>
            {d.title}
          </Select.Item>
        ))}
      </Select.Content>
    </Select>
  );
}
