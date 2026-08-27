import { IconFilter } from '@tabler/icons-react';
import { Button, Popover } from 'erxes-ui';
import { FieldPath, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSegment } from '../../context/SegmentProvider';
import { TNodePath, TSegmentForm } from '../../types';
import { emptyCondition, TSegmentNode } from '../../types/segmentNode';
import { SegmentGroup } from './SegmentGroup';

/**
 * The filters that narrow which related records a measure sees.
 *
 * They sit behind the row rather than in it: a count of won deals closed this
 * quarter is still one condition, and spreading it across three rows would
 * lose that.
 */
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

  const childPath = `${path}.child` as FieldPath<TSegmentForm>;
  const child = useWatch({ control: form.control, name: childPath }) as
    | TSegmentNode
    | undefined;

  const count = child?.kind === 'group' ? child.children.length : child ? 1 : 0;

  const open = () => {
    if (child?.kind === 'group') {
      return;
    }

    // The popover always edits a group, so a bare condition is wrapped and an
    // empty relation starts with one row to fill in.
    form.setValue(
      childPath,
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
      <Popover.Content align="start" className="w-[560px] p-3">
        <p className="text-sm text-muted-foreground pb-2">
          {t('only-count-where', { label: label.toLowerCase() })}
        </p>
        {child?.kind === 'group' && (
          <SegmentGroup path={`${path}.child`} contextType={relatedType} />
        )}
      </Popover.Content>
    </Popover>
  );
};
