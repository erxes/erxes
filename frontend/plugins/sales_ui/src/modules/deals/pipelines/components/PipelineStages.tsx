import {
  Sortable,
  Props as SortableProps,
} from '@/deals/components/common/Sortable';

import { IconPlus } from '@tabler/icons-react';
import PipelineStageItem from './PipelineStageItem';
import { Spinner } from 'erxes-ui';
import { useFieldArray } from 'react-hook-form';
import { verticalListSortingStrategy } from '@dnd-kit/sortable';

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

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'stages',
  });

  if (stagesLoading) return <Spinner />;

  const items = (fields || []).map((field) => field.id);

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
        items={items || []}
        renderItem={({ value, index, ...sortableProps }: any) => {
          return (
            <PipelineStageItem
              {...sortableProps}
              key={value}
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
