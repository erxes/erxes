import { type RefObject, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebouncedCallback } from 'use-debounce';
import { Button } from '../../../components/button';
import { Popover } from '../../../components/popover';
import { Skeleton } from '../../../components/skeleton';
import { useFormat } from '../../../lib/format';
import { isUndefinedOrNull } from '../../../utils/IsUndefinedOrNull';
import type { TConditionGroup } from '../../conditions/conditions';
import { completeOf } from '../../conditions/filterRule';
import { ConditionsEditor } from '../../conditions/ConditionsEditor';
import { useListFilter } from './listFilterContext';

/** How long the list waits after an edit before it follows. */
const APPLY_MS = 300;

/** "1,204 match", from the list's own count as it follows the edits. */
const MatchCount = () => {
  const { t } = useTranslation('views', { keyPrefix: 'filter' });
  const { totalCount, totalCapped } = useListFilter();
  const fmt = useFormat();

  if (isUndefinedOrNull(totalCount)) return <Skeleton className="h-3.5 w-16" />;

  return (
    <output aria-live="polite" className="text-xs tabular-nums text-muted-foreground">
      {t('match', {
        count: totalCapped ? 2 : totalCount,
        formatted: fmt.count(totalCount, totalCapped),
        defaultValue_one: '{{formatted}} match',
        defaultValue_other: '{{formatted}} match',
      })}
    </output>
  );
};

/**
 * Mounted while open, so the draft starts from the list's filter. Unfinished rules stay in the
 * draft; the finished ones reach the list as editing pauses, and the table behind follows.
 */
const AdvancedEditor = ({ onDone }: { onDone: () => void }) => {
  const { t } = useTranslation('views', { keyPrefix: 'filter' });
  const { fields, lookups, advanced, setAdvanced } = useListFilter();
  const [draft, setDraft] = useState<TConditionGroup | undefined>(advanced ?? undefined);

  const apply = useDebouncedCallback(
    (next: TConditionGroup | undefined) => setAdvanced(next ? completeOf(next) : null),
    APPLY_MS,
  );

  useEffect(() => () => apply.flush(), [apply]);

  return (
    <div className="flex flex-col">
      <div className="max-h-popup overflow-y-auto p-3">
        <ConditionsEditor
          fields={fields}
          {...lookups}
          value={draft}
          onChange={(next) => {
            setDraft(next);
            apply(next);
          }}
        />
      </div>
      <div className="flex h-10 items-center gap-2 border-t px-3">
        <MatchCount />
        <Button
          size="sm"
          variant="ghost"
          tone="muted"
          className="ml-auto"
          disabled={!draft}
          onClick={() => {
            setDraft(undefined);
            apply(undefined);
          }}
        >
          {t('clear-all', 'Clear all')}
        </Button>
        <Button size="sm" variant="secondary" onClick={onDone}>
          {t('done', 'Done')}
        </Button>
      </div>
    </div>
  );
};

/**
 * The advanced filter: rows "Where / And / Or" with nested groups, in a popover anchored to the
 * filter row. It doesn't block the page: the list updates behind it as the rules change.
 */
export const AdvancedPopover = ({ anchor }: { anchor: RefObject<HTMLElement | null> }) => {
  const { t } = useTranslation('views', { keyPrefix: 'filter' });
  const { advancedOpen, setAdvancedOpen } = useListFilter();

  return (
    <Popover open={advancedOpen} onOpenChange={setAdvancedOpen}>
      <Popover.Content
        anchor={anchor}
        align="start"
        variant="flush"
        collisionPadding={16}
        aria-label={t('advanced', 'Advanced filter')}
        className="w-3xl max-w-full"
      >
        {advancedOpen && <AdvancedEditor onDone={() => setAdvancedOpen(false)} />}
      </Popover.Content>
    </Popover>
  );
};
