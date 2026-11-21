import type { DataExtensionField } from '@erxes/core-contract';
import { orpc } from '@erxes/core-contract/client';
import { closestCenter, DndContext, type DragEndEvent } from '@dnd-kit/core';
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { IconColumns } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Empty, useSortList } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { QueryState } from '~/components/QueryState';
import { useSortSensors } from '~/lib/sortSensors';
import { fieldsQuery } from '../dataQueries';
import { useDataErrorToast } from '../useDataErrors';
import { FieldRow } from './FieldRow';

/** The active fields in order, dragged into a new one: saved at once, shown before it is. */
const SortableFields = ({
  recordType,
  fields,
}: {
  recordType: string;
  fields: DataExtensionField[];
}) => {
  const client = useQueryClient();
  const failed = useDataErrorToast();
  const sensors = useSortSensors();

  const sortList = useSortList(
    (id) => fields.find((field) => field.id === id)?.label ?? String(id),
  );

  const key = fieldsQuery(recordType).queryKey;

  const reorder = useMutation(
    orpc.dataFields.reorder.mutationOptions({
      onSuccess: (data) => client.setQueryData(key, data),
      onError: (error) => {
        failed(error);
        void client.invalidateQueries({ queryKey: key });
      },
    }),
  );

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    const from = fields.findIndex((field) => field.id === active.id);
    const to = fields.findIndex((field) => field.id === over?.id);

    if (from === -1 || to === -1 || from === to) return;

    const next = arrayMove(fields, from, to);

    client.setQueryData(key, { data: next });
    reorder.mutate({ recordType, ids: next.map((field) => field.id) });
  };

  return (
    <DndContext
      {...sortList}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
      onDragEnd={handleDragEnd}
      sensors={sensors}
    >
      <SortableContext
        items={fields.map((field) => field.id)}
        strategy={verticalListSortingStrategy}
      >
        <ul className="flex flex-col gap-1">
          {fields.map((field) => (
            <FieldRow key={field.id} field={field} sortable />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
};

const NoFields = () => {
  const { t } = useTranslation('data', { keyPrefix: 'fields' });

  return (
    <Empty>
      <Empty.Header>
        <Empty.Media variant="icon">
          <IconColumns />
        </Empty.Media>
        <Empty.Title>{t('empty', 'No fields yet')}</Empty.Title>
        <Empty.Description>
          {t(
            'empty-description',
            'Add a field to keep more about each record: a value, a choice, a formula or a link.',
          )}
        </Empty.Description>
      </Empty.Header>
    </Empty>
  );
};

/** A record type's fields: the active ones to drag into order, then the archived ones. */
export const FieldList = ({ recordType }: { recordType: string }) => {
  const { t } = useTranslation('data', { keyPrefix: 'fields' });
  const active = useQuery(fieldsQuery(recordType));
  const archived = useQuery(fieldsQuery(recordType, true));

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 p-6">
      <QueryState query={active} isEmpty={({ data }) => !data.length} empty={<NoFields />}>
        {({ data }) => <SortableFields recordType={recordType} fields={data} />}
      </QueryState>
      <QueryState query={archived} isEmpty={({ data }) => !data.length}>
        {({ data }) => (
          <section className="flex flex-col gap-2">
            <h2 className="text-sm font-semibold text-muted-foreground">
              {t('archived', 'Archived')}
            </h2>
            <ul className="flex flex-col gap-1">
              {data.map((field) => (
                <FieldRow key={field.id} field={field} sortable={false} />
              ))}
            </ul>
          </section>
        )}
      </QueryState>
    </div>
  );
};
