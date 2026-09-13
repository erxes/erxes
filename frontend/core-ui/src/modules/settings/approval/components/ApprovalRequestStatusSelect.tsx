import { ApprovalRequestStatusFilter } from '@/settings/approval/hooks/useApprovalRequests';
import { IconClock, IconListDetails } from '@tabler/icons-react';
import { Select, useMultiQueryState } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { APPROVAL_REQUEST_STATUS_META } from './approvalRequestUtils';

const STATUS_FILTERS: ApprovalRequestStatusFilter[] = [
  'all',
  'pending',
  'approved',
  'rejected',
  'cancelled',
];

const DEFAULT_STATUS: ApprovalRequestStatusFilter = 'pending';

// 'all' is a filter rather than a status, so it is the one icon the shared
// status meta cannot supply.
const getStatusIcon = (filter: ApprovalRequestStatusFilter): typeof IconClock =>
  filter === 'all'
    ? IconListDetails
    : APPROVAL_REQUEST_STATUS_META[filter].icon;

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
      <Select.Trigger className="h-8 w-auto gap-1 shadow-none hover:bg-accent-foreground/10">
        <Select.Value />
      </Select.Trigger>
      <Select.Content>
        {STATUS_FILTERS.map((filter) => {
          const Icon = getStatusIcon(filter);

          return (
            <Select.Item key={filter} value={filter}>
              <span className="flex items-center gap-2">
                <Icon className="size-4 text-muted-foreground" />
                {t(`status-filter-${filter}`)}
              </span>
            </Select.Item>
          );
        })}
      </Select.Content>
    </Select>
  );
};
