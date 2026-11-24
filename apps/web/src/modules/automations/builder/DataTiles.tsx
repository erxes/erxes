import { IconCheck, IconChevronDown, IconPlus } from '@tabler/icons-react';
import { cn, FieldTypeIcon } from 'erxes-ui';
import { type DragEvent, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { DataItem } from './dataSources';
import { DATA_PATH_TYPE, DataTargetContext } from './dataTarget';

const FIRST = 6;
const GRID = 'grid grid-cols-3 gap-1.5';

const TILE =
  'flex min-h-16 w-full flex-col items-center justify-center gap-1 rounded-lg border p-1.5 text-center text-xs';

/** One value: drag it into a field, or click to put it at the cursor (else copy it). */
const Tile = ({
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

  const copy = () => {
    void navigator.clipboard.writeText(token).then(() => setCopied(true));
  };

  const onDragStart = (event: DragEvent) => {
    event.dataTransfer.setData(DATA_PATH_TYPE, item.path);
    event.dataTransfer.setData('text/plain', token);
    event.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className="relative" onMouseLeave={() => setCopied(false)}>
      <button
        type="button"
        draggable
        title={`${item.label}\n${token}`}
        onDragStart={onDragStart}
        onClick={() => targets.insert(item.path) || copy()}
        className={cn(
          TILE,
          'cursor-grab bg-muted/40 transition hover:border-primary/50 hover:bg-primary/5 active:cursor-grabbing',
          open && 'border-primary/50 bg-primary/5',
        )}
      >
        {copied ? (
          <IconCheck className="size-4 text-success" />
        ) : (
          <span className="text-muted-foreground [&>svg]:size-4">
            <FieldTypeIcon field={{ type: item.type }} />
          </span>
        )}
        <span className="line-clamp-2 leading-tight break-words">{item.label}</span>
      </button>
      {onToggle && (
        <button
          type="button"
          aria-label={t('data-open', 'Show what {{name}} holds', { name: item.label })}
          aria-expanded={open}
          onClick={onToggle}
          className="absolute top-0.5 right-0.5 rounded p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <IconChevronDown className={cn('size-3 transition', !open && '-rotate-90')} />
        </button>
      )}
    </div>
  );
};

const childLabel = (child: DataItem, parent: DataItem) => {
  const prefix = `${parent.label} · `;

  return child.label.startsWith(prefix) ? child.label.slice(prefix.length) : child.label;
};

/**
 * A group's values as tiles: the first few, then "+N more". A value that holds others (an owner,
 * a company) opens them underneath. While searching, every match shows, flat.
 */
export const DataTiles = ({ items, searching }: { items: DataItem[]; searching: boolean }) => {
  const { t } = useTranslation('automations');
  const [all, setAll] = useState(false);
  const [opened, setOpened] = useState<string | null>(null);
  const top = searching ? items : items.filter((item) => !item.parent);
  const shown = searching || all ? top : top.slice(0, FIRST);
  const hidden = top.length - shown.length;
  const parent = top.find((item) => item.path === opened);
  const children = parent ? items.filter((item) => item.parent === parent.path) : [];

  return (
    <>
      <div className={GRID}>
        {shown.map((item) => {
          const holds = !searching && items.some((child) => child.parent === item.path);

          return (
            <Tile
              key={item.path}
              item={item}
              open={opened === item.path}
              onToggle={
                holds ? () => setOpened(opened === item.path ? null : item.path) : undefined
              }
            />
          );
        })}
        {hidden > 0 && (
          <button
            type="button"
            onClick={() => setAll(true)}
            className={cn(
              TILE,
              'border-dashed text-primary-text hover:border-primary/50 hover:bg-primary/5',
            )}
          >
            <IconPlus className="size-4" />
            {t('data-more', '{{count}} more', { count: hidden })}
          </button>
        )}
      </div>
      {parent && children.length > 0 && (
        <div className={cn(GRID, 'mt-1.5 rounded-lg bg-muted/50 p-1.5')}>
          {children.map((child) => (
            <Tile key={child.path} item={{ ...child, label: childLabel(child, parent) }} />
          ))}
        </div>
      )}
    </>
  );
};
