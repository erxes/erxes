import { Control, Controller, useWatch } from 'react-hook-form';
import { Label, Select } from 'erxes-ui';
import { SelectBoardFormItem } from '@/pos/hooks/useSelectBoard';
import { SelectPipelineFormItem } from '@/pos/hooks/useSelectPipeline';
import { SelectStageFormItem } from '@/pos/hooks/useSelectStage';
import { useFieldsCombined } from '@/pos/hooks/useFieldsCombined';
import type { DeliveryConfigFormData } from './DeliveryConfig';

interface StageProps {
  control: Control<DeliveryConfigFormData>;
}

export const Stage: React.FC<StageProps> = ({ control }) => {
  const { fields, loading: fieldsLoading } = useFieldsCombined({
    contentType: 'sales:deal',
  });

  const boardId = useWatch({ control, name: 'boardId' });
  const pipelineId = useWatch({ control, name: 'pipelineId' });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Controller
          name="boardId"
          control={control}
          render={({ field }) => (
            <div className="space-y-2">
              <Label>BOARD</Label>
              <SelectBoardFormItem
                value={field.value}
                onValueChange={(val) => {
                  field.onChange(val);
                }}
                placeholder="Choose a board"
              />
            </div>
          )}
        />

        <Controller
          name="pipelineId"
          control={control}
          render={({ field }) => (
            <div className="space-y-2">
              <Label>PIPELINE</Label>
              <SelectPipelineFormItem
                value={field.value}
                onValueChange={field.onChange}
                boardId={boardId}
                placeholder="Choose a pipeline"
              />
            </div>
          )}
        />

        <Controller
          name="stageId"
          control={control}
          render={({ field }) => (
            <div className="space-y-2">
              <Label>STAGE</Label>
              <SelectStageFormItem
                value={field.value}
                onValueChange={field.onChange}
                pipelineId={pipelineId}
                placeholder="Choose a stage"
              />
            </div>
          )}
        />
      </div>

      <Controller
        name="mapCustomField"
        control={control}
        render={({ field }) => (
          <div className="space-y-2">
            <Label>CHOOSE MAP FIELD</Label>
            <Select value={field.value} onValueChange={field.onChange}>
              <Select.Trigger className="w-48" disabled={fieldsLoading}>
                <Select.Value
                  placeholder={fieldsLoading ? 'Loading...' : 'Select field'}
                />
              </Select.Trigger>
              <Select.Content>
                {fields.map((field) => (
                  <Select.Item key={field.name} value={field.name}>
                    {field.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>
        )}
      />
    </div>
  );
};
