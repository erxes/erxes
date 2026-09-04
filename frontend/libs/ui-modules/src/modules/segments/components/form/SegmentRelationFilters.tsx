import { IconFilter } from '@tabler/icons-react';
import { Button, Popover } from 'erxes-ui';
import { FieldPath } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSegment } from '../../context/SegmentProvider';
import { useSegmentNodeValue } from '../../hooks/useSegmentNodeValue';
import { TNodePath, TSegmentForm } from '../../types';
import { emptyCondition, TSegmentNode } from '../../types/segmentNode';
import { SegmentGroup } from './SegmentGroup';

export const SegmentRelationFilters = ({
  path,
  relatedType,
  label,
}: {
  path: TNodePath;
  relatedType: string;
  label: string;
}) => {
  const { form } = useSegment();
  const { t } = useTranslation('segment', { keyPrefix: 'detail' });

  const childPath = `${path}.child`;
  const child = useSegmentNodeValue<TSegmentNode>(childPath);

  const count = child?.kind === 'group' ? child.children.length : child ? 1 : 0;

  const open = () => {
    if (child?.kind === 'group') {
      return;
    }

    form.setValue(
      childPath as FieldPath<TSegmentForm>,
      {
        kind: 'group',
        conjunction: 'and',
        children: child ? [child] : [emptyCondition(relatedType)],
      },
      { shouldDirty: true },
    );
  };

  return (
    <Popover>
      <Popover.Trigger asChild>
        <Button
          variant="outline"
          size="icon"
          type="button"
          onClick={open}
          title={t('filter-related', { label })}
          className="relative shrink-0"
        >
          <IconFilter />
          {count > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 px-1 rounded-full bg-primary text-primary-foreground text-[10px] leading-4 text-center">
              {count}
            </span>
          )}
        </Button>
      </Popover.Trigger>
      {/* Capped and scrolling: the predicate nests as deep as the user wants,
          and the heading saying what is counted must not scroll away. */}
      <Popover.Content
        align="start"
        className="w-[560px] p-3 flex flex-col max-h-[min(32rem,var(--radix-popover-content-available-height))]"
      >
        <p className="text-sm text-muted-foreground pb-2 shrink-0">
          {t('only-count-where', { label: label.toLowerCase() })}
        </p>
        {child?.kind === 'group' && (
          <div className="min-h-0 overflow-y-auto -mx-1 px-1">
            <SegmentGroup
              path={`${path}.child`}
              contentType={relatedType}
              nested
            />
          </div>
        )}
      </Popover.Content>
    </Popover>
  );
};
