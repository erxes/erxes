import {
  IconBuilding,
  IconBuildingSkyscraper,
  IconCalendar,
  IconChevronRight,
  IconFlag,
  IconMapPin,
  IconPackage,
  IconTag,
  IconUser,
  IconUsers,
  type Icon,
} from '@tabler/icons-react';
import dayjs from 'dayjs';
import { Badge, cn, isDefined, Tooltip } from 'erxes-ui';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { SelectAssigneeDeal } from '@/deals/components/deal-selects/SelectAssigneeDeal';
import { PriorityBadge } from '@/deals/components/deal-selects/PriorityInline';
import { useOpenDealPanel } from '@/deals/hooks/useOpenDealPanel';
import { DealAmounts } from '@/deals/components/DealAmounts';
import { IDealDetail } from '@/deals/types/deals';
import { getPriorityLevel } from '@/deals/utils/dealPriority';

const MAX_NAMES = 2;

const DealField = ({
  icon: FieldIcon,
  label,
  children,
}: {
  icon: Icon;
  label: string;
  children: ReactNode;
}) => (
  <>
    <span className="flex items-center gap-1.5 text-muted-foreground">
      <FieldIcon className="size-3.5 shrink-0" />
      {label}
    </span>
    <div className="flex min-w-0 items-center">{children}</div>
  </>
);

const NameList = ({ names }: { names: string[] }) => {
  const shown = names.slice(0, MAX_NAMES).join(', ');
  const rest = names.length - MAX_NAMES;

  if (rest <= 0) {
    return <span className="truncate font-medium">{shown}</span>;
  }

  return (
    <Tooltip.Provider>
      <Tooltip>
        <Tooltip.Trigger asChild>
          <span className="flex min-w-0 cursor-default items-center gap-1">
            <span className="truncate font-medium">{shown}</span>
            <span className="shrink-0 text-muted-foreground">+{rest}</span>
          </span>
        </Tooltip.Trigger>
        <Tooltip.Content>{names.join(', ')}</Tooltip.Content>
      </Tooltip>
    </Tooltip.Provider>
  );
};

const ColorChips = ({
  items,
}: {
  items: {
    _id?: string | null;
    name?: string | null;
    colorCode?: string | null;
  }[];
}) => (
  <div className="flex min-w-0 flex-wrap gap-1">
    {items.map((item, index) => (
      <span
        key={item._id || index}
        className="inline-flex max-w-full items-center gap-1 rounded-full border px-1.5 py-0.5 text-xs"
      >
        <span
          className="size-2 shrink-0 rounded-full bg-muted-foreground"
          style={item.colorCode ? { backgroundColor: item.colorCode } : {}}
        />
        <span className="truncate">{item.name}</span>
      </span>
    ))}
  </div>
);

const getDealAmounts = (deal: IDealDetail) =>
  (deal.productsData || []).reduce<Record<string, number>>(
    (totals, product) => {
      if (product.tickUsed === false) return totals;
      const currency = product.currency || '';
      totals[currency] =
        (totals[currency] || 0) + (Number(product.amount) || 0);
      return totals;
    },
    {},
  );

const formatDate = (value?: string | Date | null) =>
  value ? dayjs(value).format('MMM D, YYYY') : '';

export const DealWidgetCard = ({ deal }: { deal: IDealDetail }) => {
  const { t } = useTranslation('sales');
  const openDealPanel = useOpenDealPanel();
  const {
    _id,
    name,
    number,
    priority,
    stage,
    pipeline,
    status,
    isComplete,
    startDate,
    closeDate,
    createdAt,
    assignedUsers,
    labels,
    tags,
    customers,
    companies,
    departments,
    branches,
  } = deal;

  const priorityNum = getPriorityLevel(priority);
  const isArchived = status === 'archived';
  const isOverdue =
    Boolean(closeDate) && !isComplete && dayjs(closeDate).isBefore(dayjs());
  const amounts = getDealAmounts(deal);
  const productCount = (deal.productsData || []).length;
  const labelItems = (labels ?? []).filter(isDefined);
  const tagItems = (tags ?? []).filter(isDefined);
  const customerNames = (customers ?? [])
    .filter(isDefined)
    .map(
      (customer) =>
        [customer.firstName, customer.lastName].filter(Boolean).join(' ') ||
        customer.email ||
        t('untitled'),
    );
  const companyNames = (companies ?? [])
    .filter(isDefined)
    .map((company) => company.primaryName || t('untitled'));
  const departmentNames = (departments ?? [])
    .filter(isDefined)
    .map((department) => department.title || '');
  const branchNames = (branches ?? [])
    .filter(isDefined)
    .map((branch) => branch.title || '');
  const assigneeIds = (assignedUsers ?? [])
    .filter(isDefined)
    .map((user) => user._id)
    .filter(isDefined);

  return (
    <div className="overflow-hidden rounded-xl border bg-background">
      <button
        type="button"
        onClick={() => openDealPanel(_id, { stack: true })}
        className="group flex w-full flex-col gap-1 px-3 pt-3 pb-2 text-left hover:bg-muted/40"
      >
        <div className="flex w-full items-start gap-2">
          <span className="min-w-0 flex-1 font-semibold leading-snug group-hover:underline">
            {name || t('untitled')}
          </span>
          {isArchived && (
            <Badge variant="secondary" className="h-5 shrink-0 py-0 text-xs">
              {t('archived')}
            </Badge>
          )}
          <IconChevronRight className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        </div>
        {(pipeline?.name || stage?.name) && (
          <div className="flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
            {pipeline?.name && (
              <span className="truncate">{pipeline.name}</span>
            )}
            {pipeline?.name && stage?.name && <span>›</span>}
            {stage?.name && (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-1.5 py-0.5 font-medium text-primary">
                <span className="size-1.5 rounded-full bg-primary" />
                {stage.name}
              </span>
            )}
          </div>
        )}
        <DealAmounts amounts={amounts} size="lg" className="mt-1" />
      </button>

      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-2 border-t px-3 py-2.5 text-xs">
        {priorityNum > 0 && (
          <DealField icon={IconFlag} label={t('priority')}>
            <PriorityBadge
              priority={priorityNum}
              className="h-5 w-fit py-0 text-xs"
            />
          </DealField>
        )}
        {(startDate || closeDate) && (
          <DealField icon={IconCalendar} label={t('close-date')}>
            <span className="truncate font-medium tabular-nums">
              {startDate && `${formatDate(startDate)} → `}
              <span className={cn(isOverdue && 'text-destructive')}>
                {formatDate(closeDate) || '—'}
              </span>
            </span>
          </DealField>
        )}
        {customerNames.length > 0 && (
          <DealField icon={IconUser} label={t('customers')}>
            <NameList names={customerNames} />
          </DealField>
        )}
        {companyNames.length > 0 && (
          <DealField icon={IconBuilding} label={t('companies')}>
            <NameList names={companyNames} />
          </DealField>
        )}
        {departmentNames.length > 0 && (
          <DealField icon={IconBuildingSkyscraper} label={t('dept')}>
            <NameList names={departmentNames} />
          </DealField>
        )}
        {branchNames.length > 0 && (
          <DealField icon={IconMapPin} label={t('branch')}>
            <NameList names={branchNames} />
          </DealField>
        )}
        {labelItems.length > 0 && (
          <DealField icon={IconTag} label={t('labels')}>
            <ColorChips items={labelItems} />
          </DealField>
        )}
        {tagItems.length > 0 && (
          <DealField icon={IconTag} label={t('tags')}>
            <ColorChips items={tagItems} />
          </DealField>
        )}
        <DealField icon={IconUsers} label={t('assigned-to')}>
          <SelectAssigneeDeal
            variant="card"
            mode="multiple"
            value={assigneeIds}
            id={_id}
          />
        </DealField>
      </div>

      <div className="flex items-center justify-between gap-2 border-t bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground">
        <span className="tabular-nums">
          {number ? `#${number}` : formatDate(createdAt)}
        </span>
        {productCount > 0 && (
          <span className="flex items-center gap-1 tabular-nums">
            <IconPackage className="size-3.5" />
            {productCount} {t('products')}
          </span>
        )}
      </div>
    </div>
  );
};
