import { Control, Controller, useWatch } from 'react-hook-form';
import { Label, Select } from 'erxes-ui';
import { SelectBoardFormItem } from '@/pos/hooks/useSelectBoard';
import { SelectPipelineFormItem } from '@/pos/hooks/useSelectPipeline';
import { SelectStageFormItem } from '@/pos/hooks/useSelectStage';
import { useFieldsCombined } from '@/pos/hooks/useFieldsCombined';
import type { DeliveryConfigFormData } from './DeliveryConfig';
import { useTranslation } from 'react-i18next';
import { usePosSettingsLabels } from '@/pos/hooks/usePosSettingsLabels';

interface StageProps {
  control: Control<DeliveryConfigFormData>;
}

export const Stage: React.FC<StageProps> = ({ control }) => {
  const { fields, loading: fieldsLoading } = useFieldsCombined({
    contentType: 'sales:sales.deal',
  });

  const boardId = useWatch({ control, name: 'boardId' });
  const pipelineId = useWatch({ control, name: 'pipelineId' });
  const { t } = useTranslation('sales');
  const labels = usePosSettingsLabels();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Controller
          name="boardId"
          control={control}
          render={({ field }) => (
            <div className="min-w-0 space-y-2">
              <Label variant="peer" className="text-sm font-medium">
                {t('board')}
              </Label>
              <SelectBoardFormItem
                value={field.value}
                onValueChange={(val) => {
                  field.onChange(val);
                }}
                placeholder={t('choose-board')}
              />
            </div>
          )}
        />

        <Controller
          name="pipelineId"
          control={control}
          render={({ field }) => (
            <div className="min-w-0 space-y-2">
              <Label variant="peer" className="text-sm font-medium">
                {labels.pipeline}
              </Label>
              <SelectPipelineFormItem
                value={field.value}
                onValueChange={field.onChange}
                boardId={boardId}
                placeholder={t('choose-pipeline')}
              />
            </div>
          )}
        />

        <Controller
          name="stageId"
          control={control}
          render={({ field }) => (
            <div className="min-w-0 space-y-2">
              <Label variant="peer" className="text-sm font-medium">
                {labels.stage}
              </Label>
              <SelectStageFormItem
                value={field.value}
                onValueChange={field.onChange}
                pipelineId={pipelineId}
                placeholder={t('choose-stage')}
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
            <Label variant="peer" className="text-sm font-medium">
              {labels.mapField}
            </Label>
            <Select value={field.value} onValueChange={field.onChange}>
              <Select.Trigger className="md:w-1/3" disabled={fieldsLoading}>
                <Select.Value
                  placeholder={fieldsLoading ? t('loading') : t('select-field')}
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
            <p className="text-xs text-accent-foreground">
              {labels.mapFieldDescription}
            </p>
          </div>
        )}
      />
    </div>
  );
};
