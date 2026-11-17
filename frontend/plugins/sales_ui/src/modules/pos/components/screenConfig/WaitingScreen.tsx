import { Control, Controller, useWatch } from 'react-hook-form';
import { Input, Label, Select } from 'erxes-ui';
import type { ScreenConfigFormData } from './ScreenConfig';
import { useTranslation } from 'react-i18next';
import {
  PosSwitchList,
  PosSwitchRow,
} from '@/pos/components/pos-edit/PosSwitchRow';
import { usePosSettingsLabels } from '@/pos/hooks/usePosSettingsLabels';

interface WaitingScreenProps {
  control: Control<ScreenConfigFormData>;
}

const FIELD_LABEL_CLASS_NAME = 'text-sm font-medium';

export const WaitingScreen: React.FC<WaitingScreenProps> = ({ control }) => {
  const { t } = useTranslation('sales');
  const labels = usePosSettingsLabels();
  const waitingType = useWatch({ control, name: 'waitingType' });
  const isTime = waitingType === 'time';
  const changeTypeOptions = [
    { value: 'time', label: t('time') },
    { value: 'count', label: t('count') },
  ];

  return (
    <PosSwitchList>
      <PosSwitchRow
        control={control}
        name="waitingIsActive"
        label={t('waiting-screen')}
        description={labels.waitingScreenDescription}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Controller
            name="waitingType"
            control={control}
            render={({ field }) => (
              <div className="min-w-0 space-y-2">
                <Label variant="peer" className={FIELD_LABEL_CLASS_NAME}>
                  {labels.changeType}
                </Label>
                <Select value={field.value} onValueChange={field.onChange}>
                  <Select.Trigger>
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Content>
                    {changeTypeOptions.map((opt) => (
                      <Select.Item key={opt.value} value={opt.value}>
                        {opt.label}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              </div>
            )}
          />
          <Controller
            name="waitingValue"
            control={control}
            render={({ field }) => (
              <div className="min-w-0 space-y-2">
                <Label variant="peer" className={FIELD_LABEL_CLASS_NAME}>
                  {isTime ? labels.changeTime : labels.changeCount}
                </Label>
                <Input
                  type="number"
                  {...field}
                  value={field.value || ''}
                  placeholder={
                    isTime ? t('enter-time-in-minutes') : t('enter-count')
                  }
                />
              </div>
            )}
          />
          <Controller
            name="waitingContentUrl"
            control={control}
            render={({ field }) => (
              <div className="min-w-0 space-y-2 md:col-span-2">
                <Label variant="peer" className={FIELD_LABEL_CLASS_NAME}>
                  {labels.contentUrl}
                </Label>
                <Input
                  type="text"
                  {...field}
                  value={field.value || ''}
                  placeholder={t('enter-content-url')}
                />
              </div>
            )}
          />
        </div>
      </PosSwitchRow>
    </PosSwitchList>
  );
};
