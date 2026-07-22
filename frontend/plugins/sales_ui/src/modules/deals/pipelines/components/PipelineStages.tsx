'use client';

import {
  Sortable,
  Props as SortableProps,
} from '@/deals/components/common/Sortable';
import { arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useMemo } from 'react';

import { IconPlus } from '@tabler/icons-react';
import { PipelineStageItem } from './PipelineStageItem';
import { Spinner } from 'erxes-ui';
import { useFieldArray } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { TPipelineForm } from '@/deals/types/pipelines';
import type { UseFormReturn } from 'react-hook-form';
import type { SortableItemProps } from '@/deals/components/common/Item';

type PipelineStageRenderItemProps = Parameters<
  NonNullable<SortableItemProps['renderItem']>
>[0];

const props: Partial<SortableProps> = {
  strategy: verticalListSortingStrategy,
  itemCount: 10,
};

type Props = {
  form: UseFormReturn<TPipelineForm>;
  stagesLoading: boolean;
};

export const PipelineStages = ({ form, stagesLoading }: Props) => {
  const { t } = useTranslation('sales');
  const { control } = form;

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'stages',
  });

  const itemIds = useMemo(() => fields.map((f) => f.id), [fields]);

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
        items={itemIds}
        reorderItems={(items, oldIndex, newIndex) => {
          move(oldIndex, newIndex);

          return arrayMove(items, oldIndex, newIndex);
        }}
        renderItem={({
          value,
          index,
          ...sortableProps
        }: PipelineStageRenderItemProps) => {
          if (index === undefined) {
            return null;
          }

          return (
            <PipelineStageItem
              {...sortableProps}
              key={String(value)}
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
        <IconPlus /> {t('add-another-stage')}
      </div>
    </div>
  );
};
