import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { Button, cn } from 'erxes-ui';
import { Fragment } from 'react';
import { FieldPath, useFieldArray } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSegment } from '../../context/SegmentProvider';
import {
  SegmentScopeProvider,
  useSegmentScope,
} from '../../context/SegmentScopeProvider';
import { INSIDE_SUFFIX } from '../../hooks/useSegmentTreeDnd';
import { useSegmentNodeValue } from '../../hooks/useSegmentNodeValue';
import { childPath, TNodePath, TSegmentForm } from '../../types';
import {
  emptyCondition,
  emptyGroup,
  TSegmentNode,
} from '../../types/segmentNode';
import { SegmentCondition } from './SegmentCondition';
import { SegmentConjunctionRail } from './SegmentConjunctionRail';
import { SegmentGroupSummary } from './SegmentGroupSummary';
import { SegmentSortableNode } from './SegmentSortableNode';
import { SegmentTreeDnd } from './SegmentTreeDnd';

const MAX_DEPTH = 2;

type SegmentGroupBodyProps = {
  path: TNodePath;
  onRemove?: () => void;
  depth?: number;
};

const SegmentGroupBody = ({
  path,
  onRemove,
  depth = 0,
}: SegmentGroupBodyProps) => {
  const { form } = useSegment();
  const { contentType, sortable, onEnterGroup } = useSegmentScope();
  const { t } = useTranslation('segment', { keyPrefix: 'detail' });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: `${path}.children` as never,
  });

  const conjunctionName = `${path}.conjunction`;
  const conjunction =
    useSegmentNodeValue<string>(conjunctionName) === 'or' ? 'or' : 'and';

  const showRail = fields.length > 1;
  const isRoot = depth === 0;

  const { setNodeRef: setEmptyRef, isOver: isOverEmpty } = useDroppable({
    id: `${path}${INSIDE_SUFFIX}`,
    disabled: !sortable || fields.length > 0,
  });

  const rows = fields.map((entry, index) => {
    const nodePath = childPath(path, index);

    const child = form.getValues(nodePath as FieldPath<TSegmentForm>) as
      | TSegmentNode
      | undefined;

    const row =
      child?.kind === 'group' ? (
        onEnterGroup ? (
          <SegmentGroupSummary
            path={nodePath}
            onEnter={() => onEnterGroup(nodePath)}
            onRemove={() => remove(index)}
          />
        ) : (
          <div className="py-1">
            <SegmentGroupBody
              path={nodePath}
              depth={depth + 1}
              onRemove={() => remove(index)}
            />
          </div>
        )
      ) : (
        <SegmentCondition
          path={nodePath}
          onRemove={() => remove(index)}
          onReplace={(next) => update(index, next as never)}
        />
      );

    return sortable ? (
      <SegmentSortableNode key={entry.id} path={nodePath}>
        {row}
      </SegmentSortableNode>
    ) : (
      <Fragment key={entry.id}>{row}</Fragment>
    );
  });

  return (
    <div
      className={cn(
        'group/group rounded-md',
        isRoot ? 'border  p-2' : 'bg-accent/80 p-1.5',
      )}
    >
      <div className="flex items-stretch">
        {showRail && (
          <SegmentConjunctionRail
            conjunction={conjunction}
            onToggle={() =>
              form.setValue(
                conjunctionName as FieldPath<TSegmentForm>,
                conjunction === 'and' ? 'or' : 'and',
                { shouldDirty: true },
              )
            }
          />
        )}

        <div className={cn('flex-1 min-w-0 flex flex-col', showRail && 'pl-2')}>
          {sortable ? (
            <SortableContext
              items={fields.map((_, index) => childPath(path, index))}
              strategy={verticalListSortingStrategy}
            >
              {rows}
            </SortableContext>
          ) : (
            rows
          )}

          {sortable && !fields.length && (
            <div
              ref={setEmptyRef}
              className={cn(
                'rounded-md border border-dashed py-4 text-center text-sm text-muted-foreground',
                isOverEmpty && 'border-primary text-primary',
              )}
            >
              {t('drop-condition-here')}
            </div>
          )}
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

        {depth < MAX_DEPTH && (
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

type SegmentGroupProps = SegmentGroupBodyProps & {
  contentType?: string;
  nested?: boolean;
  sortable?: boolean;
  onEnterGroup?: (path: TNodePath) => void;
};

export const SegmentGroup = ({
  contentType,
  nested = false,
  onEnterGroup,
  ...body
}: SegmentGroupProps) => {
  const scoped = (
    <SegmentScopeProvider
      contentType={contentType}
      nested={nested}
      onEnterGroup={onEnterGroup}
    >
      <SegmentGroupBody {...body} />
    </SegmentScopeProvider>
  );

  return body.depth || nested ? (
    scoped
  ) : (
    <SegmentTreeDnd>{scoped}</SegmentTreeDnd>
  );
};
