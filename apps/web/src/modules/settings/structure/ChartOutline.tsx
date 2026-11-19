import { IconChevronDown, IconChevronUp, IconUsers } from '@tabler/icons-react';
import { Panel } from '@xyflow/react';
import { Button } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useWorkspace } from './context';
import { IconCount } from './IconCount';
import { TypeIcon } from './TypeIcon';

/** The most units the outline names; the rest are a search or the tree away. */
const SHOWN = 8;

/**
 * The units right under the organisation, in a small card over the chart's corner: each with its
 * type and how many people it holds. A click goes to that unit. It folds to its title.
 */
export const ChartOutline = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { index, typesById, selectedId, select } = useWorkspace();
  const [open, setOpen] = useState(true);
  const units = index.children.get(index.root.id) ?? [];
  const more = index.root.childCount - Math.min(units.length, SHOWN);

  if (units.length < 2) return null;

  return (
    <Panel position="top-left">
      <nav
        aria-label={t('quick-list', 'Go to a unit')}
        className="hidden w-60 flex-col rounded-lg border bg-background shadow-sm lg:flex"
      >
        <div className="flex h-9 items-center gap-2 pr-1 pl-3 text-xs font-medium text-muted-foreground">
          <span className="min-w-0 flex-1 truncate">{t('units', 'Units')}</span>
          <span className="tabular-nums">{index.root.childCount}</span>
          <Button
            variant="ghost"
            size="icon"
            tone="muted"
            aria-expanded={open}
            aria-label={open ? t('fold-list', 'Fold the list') : t('unfold-list', 'Show the list')}
            onClick={() => setOpen(!open)}
          >
            {open ? <IconChevronUp /> : <IconChevronDown />}
          </Button>
        </div>
        {open && (
          <div className="flex flex-col gap-0.5 border-t p-1">
            {units.slice(0, SHOWN).map((unit) => (
              <Button
                key={unit.id}
                variant={unit.id === selectedId ? 'secondary' : 'ghost'}
                className="w-full justify-start"
                onClick={() => select(unit.id, unit)}
              >
                <TypeIcon type={unit.typeId ? typesById.get(unit.typeId) : undefined} size="sm" />
                <span className="min-w-0 flex-1 truncate text-left font-normal">{unit.name}</span>
                <span className="text-xs font-normal text-muted-foreground">
                  <IconCount
                    icon={<IconUsers className="size-3.5" aria-hidden />}
                    title={t('people-with-subunits', 'People, with its subunits')}
                  >
                    {unit.subtreeMemberCount}
                  </IconCount>
                </span>
              </Button>
            ))}
            {more > 0 && (
              <p className="px-2 py-1 text-xs text-muted-foreground">
                {t('more-units', '{{count}} more: search, or use the tree', { count: more })}
              </p>
            )}
          </div>
        )}
      </nav>
    </Panel>
  );
};
