import { IconChevronRight, IconTrash } from '@tabler/icons-react';
import { Button, cn } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useSegmentNodeValue } from '../../hooks/useSegmentNodeValue';
import { TNodePath } from '../../types';
import { TSegmentNode } from '../../types/segmentNode';

export const SegmentGroupSummary = ({
  path,
  onEnter,
  onRemove,
}: {
  path: TNodePath;
  onEnter: () => void;
  onRemove: () => void;
}) => {
  const { t } = useTranslation('segment', { keyPrefix: 'detail' });

  const node = useSegmentNodeValue<TSegmentNode>(path);

  const children = node?.kind === 'group' ? node.children.length : 0;
  const isAnd = node?.kind === 'group' ? node.conjunction !== 'or' : true;

  return (
    <div className="flex flex-row items-center gap-2 py-1">
      <button
        type="button"
        onClick={onEnter}
        className={cn(
          'flex flex-auto min-w-0 items-center gap-2 rounded-md border px-3 py-2',
          'text-left text-sm hover:bg-accent/60 transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        )}
      >
        <span
          className={cn(
            'shrink-0 rounded-full px-2 py-0.5 text-xs font-medium uppercase',
            isAnd
              ? 'bg-green-100 text-green-700'
              : 'bg-amber-100 text-amber-700',
          )}
        >
          {isAnd ? t('and') : t('or')}
        </span>
        <span className="flex-auto truncate text-muted-foreground">
          {t('group-of-conditions', { count: children })}
        </span>
        <IconChevronRight className="size-4 shrink-0 text-muted-foreground" />
      </button>

      <Button
        variant="ghost"
        size="icon"
        type="button"
        title={t('remove-group')}
        onClick={onRemove}
        className="shrink-0 text-destructive"
      >
        <IconTrash />
      </Button>
    </div>
  );
};
