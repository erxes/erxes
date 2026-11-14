import type { User } from '@erxes/core-contract';
import { IconAdjustmentsHorizontal, IconSearch, IconX } from '@tabler/icons-react';
import { Button, cn, Input, Label, Popover, Select, Switch } from 'erxes-ui';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { memberName, pluginLabel } from '~/lib/members';
import type { TimelineKind } from './useActivities';

const KINDS: { value: TimelineKind; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'notes', label: 'Notes' },
  { value: 'changes', label: 'Changes' },
  { value: 'plugins', label: 'Plugins' },
];

/** `all` means no filter. */
export interface TimelineFilterState {
  kind: TimelineKind;
  actorId: string;
  source: string;
  includeRelated: boolean;
}

export const NO_FILTERS: TimelineFilterState = {
  kind: 'all',
  actorId: 'all',
  source: 'all',
  includeRelated: false,
};

interface FiltersProps {
  filters: TimelineFilterState;
  onChange: (filters: TimelineFilterState) => void;
  members: User[];
  /** Plugins that record entries. */
  sources: string[];
  /** Companies can include their customers' entries. */
  canIncludeRelated: boolean;
}

const FilterSelects = ({ filters, onChange, members, sources }: FiltersProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'activity' });

  return (
    <>
      <div className="space-y-1.5">
        <p className="text-xs font-medium text-muted-foreground">{t('who', 'Who')}</p>
        <Select
          value={filters.actorId}
          onValueChange={(actorId) => onChange({ ...filters, actorId })}
        >
          <Select.Trigger className="h-8 w-full text-sm">
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="all">{t('anyone', 'Anyone')}</Select.Item>
            {members.map((member) => (
              <Select.Item key={member.id} value={member.id}>
                {memberName(member)}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
      </div>
      {sources.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">{t('source', 'Source')}</p>
          <Select
            value={filters.source}
            onValueChange={(source) => onChange({ ...filters, source })}
          >
            <Select.Trigger className="h-8 w-full text-sm">
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="all">{t('all-sources', 'All sources')}</Select.Item>
              <Select.Item value="core">{t('core', 'Core')}</Select.Item>
              {sources.map((name) => (
                <Select.Item key={name} value={name}>
                  {pluginLabel(name)}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        </div>
      )}
    </>
  );
};

/** Who, which source and (companies) their customers' entries. */
const FilterPopover = (props: FiltersProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'activity' });
  const { filters, onChange, canIncludeRelated } = props;

  const count =
    (filters.actorId !== 'all' ? 1 : 0) +
    (filters.source !== 'all' ? 1 : 0) +
    (filters.includeRelated ? 1 : 0);

  return (
    <Popover>
      <Popover.Trigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className={cn('relative size-7 text-muted-foreground', count > 0 && 'text-foreground')}
            aria-label={t('filters', 'Filters')}
          />
        }
      >
        <IconAdjustmentsHorizontal className="size-4" />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex size-3.5 items-center justify-center rounded-full bg-primary text-[9px] font-medium text-primary-foreground">
            {count}
          </span>
        )}
      </Popover.Trigger>
      <Popover.Content align="end" className="w-64">
        <div className="space-y-3">
          <FilterSelects {...props} />
          {canIncludeRelated && (
            <div className="flex items-center justify-between gap-2 text-sm">
              <Label htmlFor="timeline-include-related">
                {t('include-customers', 'Include its customers')}
              </Label>
              <Switch
                id="timeline-include-related"
                checked={filters.includeRelated}
                onCheckedChange={(includeRelated) => onChange({ ...filters, includeRelated })}
              />
            </div>
          )}
          {count > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-full text-xs"
              onClick={() => onChange({ ...NO_FILTERS, kind: filters.kind })}
            >
              {t('clear-filters', 'Clear filters')}
            </Button>
          )}
        </div>
      </Popover.Content>
    </Popover>
  );
};

/** All, notes, changes, plugins; plugins only when some plugin records entries. */
const KindTabs = ({ filters, onChange, sources }: FiltersProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'activity' });

  return (
    <div className="flex rounded-md bg-muted p-0.5">
      {KINDS.filter((item) => item.value !== 'plugins' || sources.length > 0).map((item) => (
        <button
          key={item.value}
          type="button"
          aria-pressed={filters.kind === item.value}
          onClick={() => onChange({ ...filters, kind: item.value })}
          className={cn(
            'h-6 rounded px-2.5 text-xs text-muted-foreground transition-colors hover:text-foreground',
            filters.kind === item.value && 'bg-background font-medium text-foreground shadow-xs',
          )}
        >
          {t(`kinds.${item.value}`, item.label)}
        </button>
      ))}
    </div>
  );
};

/** The search box under the toolbar; Escape or × closes it. */
export const TimelineSearch = ({
  value,
  onChange,
  onClose,
}: {
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'activity' });
  const input = useRef<HTMLInputElement>(null);

  // Opened by the search button: typing starts at once.
  useEffect(() => input.current?.focus(), []);

  return (
    <div className="relative">
      <IconSearch className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
      <Input
        ref={input}
        className="h-8 pr-8 pl-8 text-sm"
        placeholder={t('search', 'Search the timeline…')}
        aria-label={t('search', 'Search the timeline…')}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') onClose();
        }}
      />
      <button
        type="button"
        onClick={onClose}
        className="absolute top-1/2 right-1.5 flex size-5 -translate-y-1/2 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground"
        aria-label={t('close-search', 'Close search')}
      >
        <IconX className="size-3.5" />
      </button>
    </div>
  );
};

/** Kind tabs, the search toggle and the filter popover. */
export const TimelineToolbar = ({
  searching,
  onToggleSearch,
  ...props
}: FiltersProps & { searching: boolean; onToggleSearch: () => void }) => {
  const { t } = useTranslation('common', { keyPrefix: 'activity' });

  return (
    <div className="flex items-center gap-2">
      <KindTabs {...props} />
      <div className="ml-auto flex items-center gap-0.5">
        <Button
          variant="ghost"
          size="icon"
          className={cn('size-7 text-muted-foreground', searching && 'bg-accent text-foreground')}
          aria-label={t('search', 'Search the timeline…')}
          aria-pressed={searching}
          onClick={onToggleSearch}
        >
          <IconSearch className="size-4" />
        </Button>
        <FilterPopover {...props} />
      </div>
    </div>
  );
};
