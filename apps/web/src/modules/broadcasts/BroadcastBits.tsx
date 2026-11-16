import type { Broadcast } from '@erxes/core-contract';
import { IconMail, IconMessage, IconSearch } from '@tabler/icons-react';
import { Badge, Button, cn, InputGroup, Select, Spinner, useFormat } from 'erxes-ui';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { CursorPage } from '~/lib/cursorList';

/** Pasted addresses, split on spaces, commas, semicolons and lines, each once. */
export const splitAddresses = (text: string) => [
  ...new Set(
    text
      .split(/[\s,;]+/)
      .map((address) => address.trim())
      .filter(Boolean),
  ),
];

/** A search box with the list's selects after it. */
export const SearchBar = ({
  value,
  onChange,
  label,
  children,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  children?: ReactNode;
}) => (
  <div className="flex items-center gap-2">
    <InputGroup className="flex-1">
      <InputGroup.Addon>
        <IconSearch className="size-4" />
      </InputGroup.Addon>
      <InputGroup.Input
        value={value}
        placeholder={label}
        aria-label={label}
        onChange={(event) => onChange(event.target.value)}
      />
    </InputGroup>
    {children}
  </div>
);

/** One of `options`, or all of them (null). */
export const OptionSelect = <T extends string>({
  label,
  value,
  options,
  onChange,
  text,
}: {
  label: string;
  value: T | null;
  options: readonly T[];
  onChange: (value: T | null) => void;
  text: (value: T) => string;
}) => {
  const { t } = useTranslation('broadcasts');

  return (
    <Select
      value={value ?? 'all'}
      onValueChange={(next) => onChange(options.find((option) => option === next) ?? null)}
    >
      <Select.Trigger className="w-36" aria-label={label}>
        <Select.Value />
      </Select.Trigger>
      <Select.Content>
        <Select.Item value="all">{t('status-all', 'All')}</Select.Item>
        {options.map((option) => (
          <Select.Item key={option} value={option}>
            {text(option)}
          </Select.Item>
        ))}
      </Select.Content>
    </Select>
  );
};

const STATUS_BADGE = {
  draft: 'secondary',
  scheduled: 'info',
  sending: 'default',
  paused: 'warning',
  sent: 'success',
  cancelled: 'muted',
  failed: 'destructive',
} as const satisfies Record<Broadcast['status'], string>;

export const StatusBadge = ({ status }: { status: Broadcast['status'] }) => {
  const { t } = useTranslation('broadcasts');

  return (
    <Badge variant={STATUS_BADGE[status]}>{t(`status.${status}`, { defaultValue: status })}</Badge>
  );
};

/** Email or SMS, in a tile. */
export const ChannelIcon = ({
  channel,
  className,
}: {
  channel: Broadcast['channel'];
  className?: string;
}) => {
  const Icon = channel === 'email' ? IconMail : IconMessage;

  return (
    <span
      className={cn(
        'flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary-text',
        className,
      )}
    >
      <Icon className="size-4" />
    </span>
  );
};

/** A keyset list's pages as one list of rows and the total. */
export const flattenPages = <T,>({ pages }: { pages: CursorPage<T>[] }) => ({
  rows: pages.flatMap((page) => page.data),
  total: pages[0]?.totalCount ?? 0,
});

/** "Load more" under a list while it has more pages. */
export const LoadMore = ({
  query,
}: {
  query: { hasNextPage: boolean; isFetchingNextPage: boolean; fetchNextPage: () => unknown };
}) => {
  const { t } = useTranslation('broadcasts');

  if (!query.hasNextPage) return null;

  return (
    <div className="flex justify-center border-t py-2">
      <Button
        variant="ghost"
        size="sm"
        disabled={query.isFetchingNextPage}
        onClick={() => void query.fetchNextPage()}
      >
        {query.isFetchingNextPage ? <Spinner size="sm" /> : t('load-more', 'Load more')}
      </Button>
    </div>
  );
};

/** A part of a whole as a percentage in the member's language, or a dash when the whole is nothing. */
export const usePercent = () => {
  const fmt = useFormat();

  return (part: number, whole: number) =>
    whole > 0 ? `${fmt.number(Math.round((part / whole) * 1000) / 10)}%` : '—';
};
