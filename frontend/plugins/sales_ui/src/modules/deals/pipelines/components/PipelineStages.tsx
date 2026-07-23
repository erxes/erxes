'use client';

import { Sortable } from '@/deals/components/common/Sortable';
import { arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useMemo } from 'react';

import { IconLayoutColumns, IconPlus } from '@tabler/icons-react';
import { PipelineStageItem } from './PipelineStageItem';
import { Button, Empty, Separator, Spinner } from 'erxes-ui';
import { useFieldArray } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { TPipelineForm } from '@/deals/types/pipelines';
import type { UseFormReturn } from 'react-hook-form';
import type { SortableItemProps } from '@/deals/components/common/Item';

type PipelineStageRenderItemProps = Parameters<
  NonNullable<SortableItemProps['renderItem']>
>[0];

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
    <div className="flex h-full flex-col gap-5">
      {fields.length === 0 ? (
        <Empty className="border-0 bg-transparent">
          <Empty.Header>
            <Empty.Media variant="icon">
              <IconLayoutColumns />
            </Empty.Media>
            <Empty.Title>{t('no-stages-yet')}</Empty.Title>
            <Empty.Description>
              {t('create-stage-to-your-board')}
            </Empty.Description>
          </Empty.Header>
          <Empty.Content>
            <Button type="button" onClick={onStageAdd}>
              <IconPlus /> {t('add-stage')}
            </Button>
          </Empty.Content>
        </Empty>
      ) : (
        <>
          <Sortable
            strategy={verticalListSortingStrategy}
            itemCount={10}
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
          <div className="flex items-center gap-3 px-5">
            <Separator className="flex-1 bg-border/70" />
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="shrink-0 rounded-full px-4 text-muted-foreground hover:text-foreground"
              onClick={onStageAdd}
            >
              <IconPlus /> {t('add-stage')}
            </Button>
            <Separator className="flex-1 bg-border/70" />
          </div>
        </>
      )}
    </div>
  );
};
