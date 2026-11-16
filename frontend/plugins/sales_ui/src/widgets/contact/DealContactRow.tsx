import { IconCalendar, IconSandbox, IconUserOff } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { Badge, Button, cn } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { MembersInline } from 'ui-modules';
import { DealAmounts } from '@/deals/components/DealAmounts';
import {
  PriorityIcon,
  PriorityTitle,
} from '@/deals/components/deal-selects/PriorityInline';
import { getPriorityLevel } from '@/deals/utils/dealPriority';
import type { TContactDeal } from './useContactDeals';

const getAmounts = (amount: unknown): Record<string, number> =>
  amount && typeof amount === 'object'
    ? Object.fromEntries(
        Object.entries(amount).filter(
          (entry): entry is [string, number] =>
            typeof entry[1] === 'number' && entry[1] !== 0,
        ),
      )
    : {};

export const DealContactRow = ({
  deal,
  onClick,
}: {
  deal: TContactDeal;
  onClick: () => void;
}) => {
  const { t } = useTranslation('sales');
  const title = deal.name || t('untitled', 'Untitled');
  const archived = deal.status === 'archived';
  const overdue = Boolean(
    deal.closeDate && dayjs(deal.closeDate).isBefore(dayjs(), 'day'),
  );
  const assigneeIds = (deal.assignedUserIds || []).flatMap((id) =>
    id ? [id] : [],
  );
  const amounts = getAmounts(deal.amount);
  const priority = getPriorityLevel(deal.priority);

  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className="h-auto w-full min-w-0 items-center justify-start gap-2.5 rounded-sm p-2 text-left"
    >
      <span
        className={cn(
          'flex size-7 shrink-0 items-center justify-center rounded',
          archived
            ? 'bg-amber-100 text-amber-700'
            : 'bg-primary/10 text-primary',
        )}
      >
        <IconSandbox className="size-4" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1.5">
        <span className="flex min-w-0 items-center gap-1.5 text-sm">
          <span className="min-w-0 truncate" title={title}>
            {title}
          </span>
          {deal.number && (
            <span className="shrink-0 text-xs font-normal text-muted-foreground">
              #{deal.number}
            </span>
          )}
          {archived && (
            <Badge
              variant="secondary"
              className="h-5 shrink-0 px-1.5 font-normal"
            >
              {t('archived', 'Archived')}
            </Badge>
          )}
        </span>
        <span className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-xs font-normal text-muted-foreground">
          {priority > 0 && (
            <span className="inline-flex items-center gap-1">
              <PriorityIcon priority={priority} className="size-3.5" />
              <PriorityTitle priority={priority} className="font-normal" />
            </span>
          )}
          {deal.stage?.name && (
            <span className="inline-flex min-w-0 max-w-full items-center gap-1">
              <span className="size-1.5 shrink-0 rounded-full bg-primary" />
              <span className="truncate">
                {deal.pipeline?.name
                  ? `${deal.pipeline.name} › ${deal.stage.name}`
                  : deal.stage.name}
              </span>
            </span>
          )}
          <span className="inline-flex min-w-0 max-w-full items-center gap-1">
            {assigneeIds.length ? (
              <MembersInline.Provider memberIds={assigneeIds} showInactive>
                <MembersInline.Avatar className="size-4" />
                <MembersInline.Title className="truncate text-xs font-normal" />
              </MembersInline.Provider>
            ) : (
              <>
                <IconUserOff className="size-3.5 shrink-0" />
                {t('no-assignee', 'No assignee')}
              </>
            )}
          </span>
          {deal.closeDate && (
            <span
              className={cn(
                'inline-flex items-center gap-1',
                overdue && 'text-destructive',
              )}
            >
              <IconCalendar className="size-3.5 shrink-0" />
              {dayjs(deal.closeDate).format('MMM D')}
            </span>
          )}
        </span>
      </span>
      <DealAmounts
        amounts={amounts}
        className="shrink-0 flex-col items-end gap-0"
      />
    </Button>
  );
};
