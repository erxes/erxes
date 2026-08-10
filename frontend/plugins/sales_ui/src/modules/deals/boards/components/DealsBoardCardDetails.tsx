import {
  IconBuilding,
  IconBuildingSkyscraper,
  IconGitBranch,
  IconPackage,
  IconUsers,
} from '@tabler/icons-react';
import { Avatar, Badge, Tooltip, cn } from 'erxes-ui';

export interface DealCardProductItem {
  _id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  currency?: string;
}

export interface DealCardRelationItem {
  _id: string;
  name: string;
  avatar?: string;
}

export interface DealCardDetailItem {
  _id?: string;
  name: string;
  colorCode?: string;
}

type DealCardProductsProps = {
  items: DealCardProductItem[];
  label: string;
  totalLabel: string;
  muted?: boolean;
};

type DealCardRelationDetailsProps = {
  items: DealCardRelationItem[];
  type: 'customer' | 'company' | 'department' | 'branch';
};

type DealCardDetailsProps = {
  items: DealCardDetailItem[];
  color: string;
};

const MAX_VISIBLE_PRODUCTS = 3;
const MAX_VISIBLE_AVATARS = 3;
const MAX_VISIBLE_DETAILS = 5;

const RELATION_ICONS = {
  customer: IconUsers,
  company: IconBuilding,
  department: IconBuildingSkyscraper,
  branch: IconGitBranch,
};

const formatAmount = (value: number, currency?: string) => {
  const formattedValue = value.toLocaleString(undefined, {
    maximumFractionDigits: 2,
  });

  if (!currency) {
    return formattedValue;
  }

  return /^[A-Z]{3}$/.test(currency)
    ? `${formattedValue} ${currency}`
    : `${formattedValue}${currency}`;
};

const getInitials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('');

const TooltipItemList = ({ items }: { items: string[] }) => (
  <div className="flex max-w-64 flex-col gap-1">
    {items.map((item, index) => (
      <span key={`${item}-${index}`} className="wrap-break-word">
        {item}
      </span>
    ))}
  </div>
);

export const DealCardProducts = ({
  items,
  label,
  totalLabel,
  muted,
}: DealCardProductsProps) => {
  if (!items.length) {
    return null;
  }

  const visibleItems = items.slice(0, MAX_VISIBLE_PRODUCTS);
  const remainingCount = items.length - visibleItems.length;
  const totals = items.reduce<Record<string, number>>((result, item) => {
    const currency = item.currency || '';
    result[currency] = (result[currency] || 0) + item.amount;
    return result;
  }, {});

  return (
    <Tooltip.Provider>
      <div
        className={cn(
          'rounded-lg border border-border bg-muted/30 px-2.5 py-2',
          muted && 'opacity-60',
        )}
      >
        <div className="flex items-center justify-between gap-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          <span className="flex min-w-0 items-center gap-1.5">
            <IconPackage className="size-3.5 shrink-0" />
            <span className="truncate">{label}</span>
          </span>
          <span className="shrink-0 tabular-nums">{items.length}</span>
        </div>
        <div className="mt-1.5 flex flex-col gap-1">
          {visibleItems.map((item) => (
            <div
              key={item._id}
              className="-mx-1 flex min-w-0 items-end justify-between gap-3 rounded-md px-1 py-0.5 text-xs transition-colors hover:bg-background/80"
            >
              <div className="min-w-0">
                <Tooltip delayDuration={200}>
                  <Tooltip.Trigger asChild>
                    <div className="truncate text-sm text-foreground">
                      {item.name}
                    </div>
                  </Tooltip.Trigger>
                  <Tooltip.Content>{item.name}</Tooltip.Content>
                </Tooltip>
                <div className="text-[9px] leading-3 text-muted-foreground tabular-nums">
                  {item.quantity.toLocaleString()} ×{' '}
                  {formatAmount(item.unitPrice, item.currency)}
                </div>
              </div>
              <span className="shrink-0 pb-0.5 text-[10px] font-medium text-foreground tabular-nums">
                {formatAmount(item.amount, item.currency)}
              </span>
            </div>
          ))}
          {remainingCount > 0 && (
            <Tooltip delayDuration={200}>
              <Tooltip.Trigger asChild>
                <span className="w-fit cursor-default text-[11px] text-muted-foreground hover:text-foreground">
                  +{remainingCount}
                </span>
              </Tooltip.Trigger>
              <Tooltip.Content>
                <TooltipItemList
                  items={items
                    .slice(MAX_VISIBLE_PRODUCTS)
                    .map((item) => item.name)}
                />
              </Tooltip.Content>
            </Tooltip>
          )}
        </div>
        <div className="mt-1.5 flex flex-col gap-1 border-t border-border pt-1.5">
          {Object.entries(totals).map(([currency, total]) => (
            <div
              key={currency || 'no-currency'}
              className="flex items-center justify-between gap-3 text-[11px] font-semibold"
            >
              <span className="text-muted-foreground">{totalLabel}</span>
              <span className="shrink-0 tabular-nums">
                {formatAmount(total, currency)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Tooltip.Provider>
  );
};

export const DealCardRelationDetails = ({
  items,
  type,
}: DealCardRelationDetailsProps) => {
  if (!items.length) {
    return null;
  }

  const Icon = RELATION_ICONS[type];
  const visibleAvatars = items.slice(0, MAX_VISIBLE_AVATARS);
  const remainingCount = items.length - visibleAvatars.length;

  return (
    <Tooltip.Provider>
      <Tooltip delayDuration={200}>
        <Tooltip.Trigger asChild>
          <div className="flex min-w-0 cursor-default items-center gap-2 rounded-md px-1 py-0.5 text-xs text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground">
            <Icon className="size-4 shrink-0" />
            <div className="flex shrink-0 -space-x-1.5">
              {visibleAvatars.map((item) => (
                <Avatar
                  key={item._id}
                  size="lg"
                  className="border-2 border-background bg-background"
                >
                  <Avatar.Image src={item.avatar} alt="" />
                  <Avatar.Fallback className="text-[9px]">
                    {getInitials(item.name)}
                  </Avatar.Fallback>
                </Avatar>
              ))}
            </div>
            <span className="truncate">
              {items[0].name}
              {remainingCount > 0 && ` +${remainingCount}`}
            </span>
          </div>
        </Tooltip.Trigger>
        <Tooltip.Content>
          <TooltipItemList items={items.map((item) => item.name)} />
        </Tooltip.Content>
      </Tooltip>
    </Tooltip.Provider>
  );
};

export const DealCardDetails = ({ items, color }: DealCardDetailsProps) => {
  if (!items.length) {
    return null;
  }

  const visibleItems = items.slice(0, MAX_VISIBLE_DETAILS);
  const remainingCount = items.length - visibleItems.length;

  return (
    <Tooltip.Provider>
      <div className="flex flex-wrap gap-1">
        {visibleItems.map((item, index) => (
          <Tooltip
            key={`${item._id ?? item.name}-${index}`}
            delayDuration={200}
          >
            <Tooltip.Trigger asChild>
              <Badge
                variant="secondary"
                className="h-5 max-w-full cursor-default px-1.5 font-normal"
              >
                <span
                  className="size-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: item.colorCode || color }}
                />
                <span className="truncate">{item.name}</span>
              </Badge>
            </Tooltip.Trigger>
            <Tooltip.Content>{item.name}</Tooltip.Content>
          </Tooltip>
        ))}
        {remainingCount > 0 && (
          <Tooltip delayDuration={200}>
            <Tooltip.Trigger asChild>
              <Badge
                variant="ghost"
                className="h-5 cursor-default px-1.5 hover:bg-muted"
              >
                +{remainingCount}
              </Badge>
            </Tooltip.Trigger>
            <Tooltip.Content>
              <TooltipItemList
                items={items
                  .slice(MAX_VISIBLE_DETAILS)
                  .map((item) => item.name)}
              />
            </Tooltip.Content>
          </Tooltip>
        )}
      </div>
    </Tooltip.Provider>
  );
};
