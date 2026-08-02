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

/**
 * Held in the URL rather than in component state so the header select and the
 * table below it can each read it without the page having to pass it between
 * them — and so a filtered view survives a refresh or a shared link.
 */
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
    // Keep the default out of the URL
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
