'use client';

import {
  Sortable,
  Props as SortableProps,
} from '@/deals/components/common/Sortable';
import { arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useEffect, useState } from 'react';

import { IconPlus } from '@tabler/icons-react';
import PipelineStageItem from './PipelineStageItem';
import { Spinner } from 'erxes-ui';
import { UniqueIdentifier } from '@dnd-kit/core';
import { useFieldArray } from 'react-hook-form';

const props: Partial<SortableProps> = {
  strategy: verticalListSortingStrategy,
  itemCount: 10,
};

type Props = {
  form: any;
  stagesLoading: boolean;
};

const PipelineStages = ({ form, stagesLoading }: Props) => {
  const { control } = form;

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'stages',
  });

  const [sortableItems, setSortableItems] = useState<UniqueIdentifier[]>(
    fields.map((f) => f.id),
  );

  useEffect(() => {
    if (fields.length !== sortableItems.length) {
      setSortableItems(fields.map((f) => f.id));
    }
  }, [fields, sortableItems]);

  if (stagesLoading) return <Spinner />;

  const onStageAdd = () => {
    append({
      _id: Math.random().toString(),
      name: '',
      visibility: 'public',
      probability: '10%',
      status: 'active',
      memberIds: [],
      departmentIds: [],
    });
  };

  return (
    <div>
      <Sortable
        {...props}
        items={sortableItems || []}
        reorderItems={(items, oldIndex, newIndex) => {
          const newOrder = arrayMove(items, oldIndex, newIndex);
          setSortableItems(newOrder);

          newOrder.forEach((id, index) => {
            const oldIndex = fields.findIndex((f) => f.id === id);
            if (oldIndex !== index) move(oldIndex, index);
          });

          return newOrder;
        }}
        renderItem={({ value, index, ...sortableProps }: any) => {
          return (
            <PipelineStageItem
              {...sortableProps}
              key={value}
              value={value}
              index={index}
              control={control}
              stage={fields[index]}
              onRemoveStage={() => remove(index)}
            />
          );
        }}
      />
      <div
        className="flex gap-2 items-center shadow-xs p-4 rounded-md cursor-pointer hover:shadow-sm hover:text-primary transition-all duration-200"
        onClick={onStageAdd}
      >
        <IconPlus /> Add another stage
      </div>
    </div>
  );
};

export default PipelineStages;
