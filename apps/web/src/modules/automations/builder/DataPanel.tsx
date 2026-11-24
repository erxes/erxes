import type { AutomationStep } from '@erxes/core-contract';
import {
  IconBolt,
  IconCheck,
  IconChevronDown,
  IconChevronRight,
  IconCopy,
  IconRoute,
} from '@tabler/icons-react';
import { Button, cn, Input } from 'erxes-ui';
import { type DragEvent, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { type DataItem, type DataSource, useDataSources } from './dataSources';
import { DATA_PATH_TYPE, DataTargetContext } from './dataTarget';
import { InfoTip } from './Field';

const DataCard = ({
  item,
  open,
  onToggle,
}: {
  item: DataItem;
  open?: boolean;
  onToggle?: () => void;
}) => {
  const { t } = useTranslation('automations');
  const targets = useContext(DataTargetContext);
  const [copied, setCopied] = useState(false);
  const token = `{{${item.path}}}`;
  const Chevron = open ? IconChevronDown : IconChevronRight;

  const copy = () => {
    void navigator.clipboard.writeText(token).then(() => setCopied(true));
  };

  const onDragStart = (event: DragEvent) => {
    event.dataTransfer.setData(DATA_PATH_TYPE, item.path);
    event.dataTransfer.setData('text/plain', token);
    event.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onMouseLeave={() => setCopied(false)}
      className="group flex cursor-grab items-center gap-1.5 rounded-md border bg-background px-2 py-1.5 hover:border-primary/50 active:cursor-grabbing"
    >
      {onToggle && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          tone="muted"
          className="size-5 shrink-0"
          aria-label={item.label}
          aria-expanded={open}
          onClick={onToggle}
        >
          <Chevron className="size-3.5" />
        </Button>
      )}
      <button
        type="button"
        className="min-w-0 flex-1 cursor-pointer text-left"
        onClick={() => targets.insert(item.path) || copy()}
      >
        <span className="block truncate text-sm">{item.label}</span>
        <span className="block truncate font-mono text-3xs text-muted-foreground">{item.path}</span>
      </button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        tone="muted"
        className={cn(
          'size-6 shrink-0',
          copied ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
        )}
        aria-label={t('copy-data', 'Copy')}
        onClick={copy}
      >
        {copied ? (
          <IconCheck className="size-3.5 text-success" />
        ) : (
          <IconCopy className="size-3.5" />
        )}
      </Button>
    </div>
  );
};

const DataEntry = ({ item, items }: { item: DataItem; items: DataItem[] }) => {
  const [open, setOpen] = useState(false);
  const children = items.filter((child) => child.parent === item.path);
  const prefix = `${item.label} · `;

  if (!children.length) return <DataCard item={item} />;

  return (
    <div className="space-y-1.5">
      <DataCard item={item} open={open} onToggle={() => setOpen(!open)} />
      {open && (
        <div className="ml-4 space-y-1.5 border-l pl-2">
          {children.map((child) => (
            <DataCard
              key={child.path}
              item={{
                ...child,
                label: child.label.startsWith(prefix)
                  ? child.label.slice(prefix.length)
                  : child.label,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const SourceChips = ({
  sources,
  active,
  onPick,
}: {
  sources: DataSource[];
  active: string;
  onPick: (id: string) => void;
}) => (
  <div className="flex flex-wrap gap-1.5">
    {sources.map((source) => {
      const Icon = source.step ? IconRoute : IconBolt;

      return (
        <button
          key={source.id}
          type="button"
          aria-pressed={source.id === active}
          onClick={() => onPick(source.id)}
          className={cn(
            'flex max-w-full items-center gap-1 rounded-full border px-2 py-0.5 text-xs',
            source.id === active
              ? 'border-primary text-primary-text'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <Icon className="size-3 shrink-0" />
          <span className="truncate">{source.label}</span>
        </button>
      );
    })}
  </div>
);

const matches = (item: DataItem, search: string) =>
  `${item.label} ${item.path}`.toLowerCase().includes(search.trim().toLowerCase());

const GroupItems = ({ items, searching }: { items: DataItem[]; searching: boolean }) =>
  searching
    ? items.map((item) => <DataCard key={item.path} item={item} />)
    : items
        .filter((item) => !item.parent)
        .map((item) => <DataEntry key={item.path} item={item} items={items} />);

export const DataPanel = ({
  step,
  subject,
}: {
  step: AutomationStep;
  subject: 'customer' | 'company';
}) => {
  const { t } = useTranslation('automations');
  const sources = useDataSources(step, subject);
  const [picked, setPicked] = useState('trigger');
  const [search, setSearch] = useState('');
  const source = sources.find((item) => item.id === picked) ?? sources[0];
  const searching = search.trim() !== '';

  const groups = (source?.groups ?? [])
    .map((group) => ({ ...group, items: group.items.filter((item) => matches(item, search)) }))
    .filter((group) => group.items.length);

  return (
    <aside
      aria-label={t('data', 'Data')}
      className="flex w-72 shrink-0 flex-col border-l bg-background"
    >
      <div className="flex h-10 shrink-0 items-center gap-1 border-b px-4 text-sm font-medium">
        {t('data', 'Data')}
        <InfoTip text={t('data-help', 'Drag into a field, or click to put it at the cursor')} />
      </div>
      <div className="space-y-3 p-3">
        <SourceChips sources={sources} active={source?.id ?? 'trigger'} onPick={setPicked} />
        <Input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={t('insert-data-search', 'Search data…')}
        />
      </div>
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-3 pb-4">
        {groups.map((group) => (
          <section key={group.title} className="space-y-1.5">
            <h4 className="text-xs font-medium text-muted-foreground">{group.title}</h4>
            <GroupItems items={group.items} searching={searching} />
          </section>
        ))}
        {!groups.length && (
          <p className="text-xs text-muted-foreground">{t('catalog-empty', 'Nothing matches')}</p>
        )}
      </div>
    </aside>
  );
};
