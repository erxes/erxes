import {
  IconForms,
  IconLayoutKanban,
  IconStairs,
  IconTimelineEvent,
} from '@tabler/icons-react';
import { PosPanelRow } from '@/pos/components/pos-edit/PosFieldRow';
import { Control, Controller, useWatch } from 'react-hook-form';
import { Select } from 'erxes-ui';
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
      <div className="flex flex-col gap-1">
        <Controller
          name="boardId"
          control={control}
          render={({ field }) => (
            <PosPanelRow label={t('board')} icon={IconLayoutKanban}>
              <SelectBoardFormItem
                value={field.value}
                onValueChange={(val) => {
                  field.onChange(val);
                }}
                placeholder={t('choose-board')}
              />
            </PosPanelRow>
          )}
        />

        <Controller
          name="pipelineId"
          control={control}
          render={({ field }) => (
            <PosPanelRow label={labels.pipeline} icon={IconTimelineEvent}>
              <SelectPipelineFormItem
                value={field.value}
                onValueChange={field.onChange}
                boardId={boardId}
                placeholder={t('choose-pipeline')}
              />
            </PosPanelRow>
          )}
        />

        <Controller
          name="stageId"
          control={control}
          render={({ field }) => (
            <PosPanelRow label={labels.stage} icon={IconStairs}>
              <SelectStageFormItem
                value={field.value}
                onValueChange={field.onChange}
                pipelineId={pipelineId}
                placeholder={t('choose-stage')}
              />
            </PosPanelRow>
          )}
        />
      </div>

      <Controller
        name="mapCustomField"
        control={control}
        render={({ field }) => (
          <PosPanelRow label={labels.mapField} icon={IconForms}>
            <Select value={field.value} onValueChange={field.onChange}>
              <Select.Trigger disabled={fieldsLoading}>
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
          </PosPanelRow>
        )}
      />
    </div>
  );
};
