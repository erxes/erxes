import { gql, useApolloClient } from '@apollo/client';
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { cn, Skeleton, toast } from 'erxes-ui';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  buildPatchMutation,
  DataExtensionOptionBadge,
  DataExtensionValueDisplay,
  formatDataExtensionValue,
  IDataExtensionField,
  IDataExtensionFilter,
  IDataExtensionListRecord,
  IDataExtensionRecordType,
  typedRequestOptions,
  useDataExtensionAggregate,
  useDataExtensionRecordList,
  useDataExtensionRecordTypes,
} from 'ui-modules';

/** Cards loaded per board; column counts come from totals, not from cards. */
const BOARD_LIMIT = 100;
const NO_VALUE = '__none__';

const Card = ({
  record,
  fields,
  onOpen,
}: {
  record: IDataExtensionListRecord;
  fields: IDataExtensionField[];
  onOpen: (id: string) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: record._id });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={
        transform
          ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
          : undefined
      }
      onClick={() => onOpen(record._id)}
      onKeyDown={(event) => event.key === 'Enter' && onOpen(record._id)}
      className={cn(
        'flex cursor-grab flex-col gap-1.5 rounded-md border bg-background p-2.5 text-left shadow-xs outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-ring',
        isDragging && 'z-20 cursor-grabbing shadow-md',
      )}
    >
      <span className="truncate text-sm font-medium">{record.name}</span>
      {fields.map((field) => (
        <DataExtensionValueDisplay
          key={field._id}
          field={field}
          value={record.values[field.key] ?? null}
          links={record.links[field.key]}
          className="block truncate text-xs text-muted-foreground"
        />
      ))}
    </div>
  );
};

const Column = ({
  id,
  header,
  count,
  total,
  children,
}: {
  id: string;
  header: React.ReactNode;
  count: number;
  total?: string;
  children: React.ReactNode;
}) => {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <section
      ref={setNodeRef}
      aria-label={typeof header === 'string' ? header : undefined}
      className={cn(
        'flex w-72 shrink-0 flex-col gap-2 rounded-lg bg-muted/50 p-2 transition-colors',
        isOver && 'bg-primary/10 ring-2 ring-primary/30',
      )}
    >
      <header className="flex items-center gap-2 px-1 pt-0.5">
        {header}
        <span className="text-xs tabular-nums text-muted-foreground">{count}</span>
        {total && (
          <span className="ml-auto truncate text-xs tabular-nums text-muted-foreground">
            {total}
          </span>
        )}
      </header>
      <div className="flex min-h-12 flex-col gap-1.5 overflow-y-auto">{children}</div>
    </section>
  );
};

/**
 * Records as cards in one column per option of a choice field. Dropping a
 * card on another column saves that option through the usual patch.
 */
export const DataExtensionKanban = ({
  recordType,
  fields,
  groupField,
  filter,
  searchValue,
  onOpen,
  version,
}: {
  recordType: IDataExtensionRecordType;
  fields: IDataExtensionField[];
  groupField: IDataExtensionField;
  filter: IDataExtensionFilter;
  searchValue?: string;
  onOpen: (id: string) => void;
  /** Bumped by the parent after a record changes elsewhere. */
  version: number;
}) => {
  const { t, i18n } = useTranslation('dataExtensions');
  const client = useApolloClient();
  const { recordTypes } = useDataExtensionRecordTypes();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor),
  );
  const totalField = fields.find((field) => field.type === 'currency');
  const cardFields = useMemo(
    () =>
      fields
        .filter((field) => field.key !== groupField.key && field.type !== 'json')
        .slice(0, 2),
    [fields, groupField.key],
  );
  const { records, loading, refetch } = useDataExtensionRecordList(
    recordType,
    fields,
    recordTypes,
    { filter, searchValue, limit: BOARD_LIMIT, sortField: 'updatedAt', sortDirection: -1 },
  );
  const { groups, refetch: refetchTotals } = useDataExtensionAggregate(recordType, {
    filter,
    groupBy: groupField.key,
    metrics: totalField ? [{ op: 'sum', field: totalField.key }] : [],
  });
  const [moved, setMoved] = useState<Record<string, string | null>>({});

  useEffect(() => {
    refetch();
    refetchTotals();
    // The parent bumps `version` when a record was edited in its sheet.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version]);

  useEffect(() => setMoved({}), [records]);

  const columnOf = (record: IDataExtensionListRecord) => {
    const value =
      record._id in moved ? moved[record._id] : record.values[groupField.key];

    return typeof value === 'string' ? value : NO_VALUE;
  };

  const totalFor = (key: string | null) => {
    const group = groups.find((candidate) => (candidate.key ?? null) === key);
    const amount = group?.values[0];

    if (!totalField || typeof amount !== 'number') {
      return undefined;
    }

    return formatDataExtensionValue(
      totalField,
      { amount, currency: totalField.settings?.currency || 'MNT' },
      { locale: i18n.language },
    );
  };

  const onDragEnd = async ({ active, over }: DragEndEvent) => {
    if (!over) {
      return;
    }

    const record = records.find((candidate) => candidate._id === active.id);
    const target = over.id === NO_VALUE ? null : String(over.id);

    if (!record || columnOf(record) === (target ?? NO_VALUE)) {
      return;
    }

    setMoved((current) => ({ ...current, [record._id]: target }));

    try {
      await client.mutate({
        mutation: gql(buildPatchMutation(recordType, fields, recordTypes)),
        variables: { _id: record._id, values: { [groupField.key]: target } },
        ...typedRequestOptions,
      });
      refetchTotals();
    } catch (error) {
      setMoved((current) => {
        const next = { ...current };

        delete next[record._id];

        return next;
      });
      toast({
        variant: 'destructive',
        title: t('views.move-failed', { name: record.name }),
        description: error instanceof Error ? error.message : undefined,
      });
    }
  };

  const columns = [
    ...(groupField.options || []).map((option) => ({
      id: option.value,
      key: option.value as string | null,
      header: <DataExtensionOptionBadge option={option} />,
    })),
    {
      id: NO_VALUE,
      key: null,
      header: (
        <span className="text-xs font-medium text-muted-foreground">
          {t('views.no-value', { label: groupField.label })}
        </span>
      ),
    },
  ];

  if (loading && !records.length) {
    return (
      <div className="flex gap-3 overflow-hidden p-3">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-64 w-72 shrink-0 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} onDragEnd={onDragEnd}>
      <div className="flex h-full min-h-0 gap-3 overflow-x-auto p-3">
        {columns.map((column) => {
          const cards = records.filter((record) => columnOf(record) === column.id);
          const count =
            groups.find((group) => (group.key ?? null) === column.key)?.count ??
            cards.length;

          return (
            <Column
              key={column.id}
              id={column.id}
              header={column.header}
              count={count}
              total={totalFor(column.key)}
            >
              {cards.map((record) => (
                <Card key={record._id} record={record} fields={cardFields} onOpen={onOpen} />
              ))}
              {count > cards.length && (
                <p className="px-1 text-xs text-muted-foreground">
                  {t('views.more-cards', { count: count - cards.length })}
                </p>
              )}
            </Column>
          );
        })}
      </div>
    </DndContext>
  );
};
