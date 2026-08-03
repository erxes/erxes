import { ApprovalRequestStatusFilter } from '@/settings/approval/hooks/useApprovalRequests';
import { Select, useMultiQueryState } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

const STATUS_FILTERS: ApprovalRequestStatusFilter[] = [
  'all',
  'pending',
  'approved',
  'rejected',
  'cancelled',
];

const DEFAULT_STATUS: ApprovalRequestStatusFilter = 'pending';

export const useApprovalRequestStatus = () => {
  const [queryParams, setQueryParams] = useMultiQueryState<{ status: string }>([
    'status',
  ]);

  const status = STATUS_FILTERS.includes(
    queryParams.status as ApprovalRequestStatusFilter,
  )
    ? (queryParams.status as ApprovalRequestStatusFilter)
    : DEFAULT_STATUS;

  const setStatus = (next: ApprovalRequestStatusFilter) =>
    setQueryParams({ status: next === DEFAULT_STATUS ? null : next });

  return { status, setStatus };
};

export const ApprovalRequestStatusSelect = () => {
  const { t } = useTranslation('approval');
  const { status, setStatus } = useApprovalRequestStatus();

  return (
    <Select
      value={status}
      onValueChange={(next) => setStatus(next as ApprovalRequestStatusFilter)}
    >
      <Select.Trigger className="h-8 w-40">
        <Select.Value />
      </Select.Trigger>
      <Select.Content>
        {STATUS_FILTERS.map((filter) => (
          <Select.Item key={filter} value={filter}>
            {t(`status-filter-${filter}`)}
          </Select.Item>
        ))}
      </Select.Content>
    </Select>
  );
};
