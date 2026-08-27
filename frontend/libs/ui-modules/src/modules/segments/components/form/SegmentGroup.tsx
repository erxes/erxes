import { IconPlus, IconTrash } from '@tabler/icons-react';
import { Button, cn } from 'erxes-ui';
import { FieldPath, useFieldArray, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSegment } from '../../context/SegmentProvider';
import { childPath, TNodePath, TSegmentForm } from '../../types';
import {
  emptyCondition,
  emptyGroup,
  TSegmentNode,
} from '../../types/segmentNode';
import { SegmentCondition } from './SegmentCondition';
import { SegmentConjunctionRail } from './SegmentConjunctionRail';

/**
 * A group of conditions, joined by and / or.
 *
 * It renders itself for nested groups, and each level is lighter than the one
 * above: the root carries the surface, everything below is the gutter and its
 * badge. Repeating the full card at every depth is what made three levels
 * unreadable.
 */
export const SegmentGroup = ({
  path,
  onRemove,
  depth = 0,
  contextType,
}: {
  path: TNodePath;
  onRemove?: () => void;
  depth?: number;
  /** The entity the rows inside this group describe. */
  contextType?: string;
}) => {
  const { form, contentType: segmentType } = useSegment();
  const contentType = contextType || segmentType;
  const { t } = useTranslation('segment', { keyPrefix: 'detail' });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: `${path}.children` as never,
  });

  const conjunctionName = `${path}.conjunction` as FieldPath<TSegmentForm>;
  // `useWatch` subscribes to this one path; `watch` would re-render the whole
  // group - and every row inside it - on any keystroke anywhere in the form.
  const conjunction =
    useWatch({ control: form.control, name: conjunctionName }) === 'or'
      ? 'or'
      : 'and';

  // With a single child there is nothing to join, so the gutter would be
  // decoration.
  const showRail = fields.length > 1;
  const isRoot = depth === 0;

  return (
    <div
      className={cn(
        'group/group rounded-md',
        isRoot ? 'border bg-background p-2' : 'bg-accent/40 p-2',
      )}
    >
      <div className="flex items-start">
        {showRail && (
          <SegmentConjunctionRail
            conjunction={conjunction}
            onToggle={() =>
              form.setValue(
                conjunctionName,
                conjunction === 'and' ? 'or' : 'and',
                { shouldDirty: true },
              )
            }
          />
        )}

        <div className={cn('flex-1 min-w-0 flex flex-col', showRail && 'pl-8')}>
          {fields.map((entry, index) => {
            const child = form.getValues(
              childPath(path, index) as FieldPath<TSegmentForm>,
            ) as TSegmentNode | undefined;

            return child?.kind === 'group' ? (
              <div key={entry.id} className="py-1.5">
                <SegmentGroup
                  path={childPath(path, index)}
                  depth={depth + 1}
                  contextType={contextType}
                  onRemove={() => remove(index)}
                />
              </div>
            ) : (
              <SegmentCondition
                key={entry.id}
                path={childPath(path, index)}
                contextType={contextType}
                onRemove={() => remove(index)}
                onReplace={(next) => update(index, next as never)}
              />
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-1 pt-1.5">
        <Button
          variant="ghost"
          size="sm"
          type="button"
          className="text-muted-foreground"
          onClick={() => append(emptyCondition(contentType))}
        >
          <IconPlus />
          {t('add-condition')}
        </Button>
        {/* Nesting deeper than a couple of levels stops being readable, and
            production segments never went past three. */}
        {depth < 2 && (
          <Button
            variant="ghost"
            size="sm"
            type="button"
            className="text-muted-foreground"
            onClick={() =>
              append({
                ...emptyGroup(),
                children: [emptyCondition(contentType)],
              })
            }
          >
            <IconPlus />
            {t('add-group')}
          </Button>
        )}

        <div className="flex-1" />

        {onRemove && (
          <Button
            variant="ghost"
            size="icon"
            type="button"
            title={t('remove-group')}
            onClick={onRemove}
            className="opacity-0 group-hover/group:opacity-100 transition-opacity text-destructive"
          >
            <IconTrash />
          </Button>
        )}
      </div>
    </div>
  );
};
