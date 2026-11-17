import { Control, Controller, useWatch } from 'react-hook-form';
import { Input, Label, Select } from 'erxes-ui';
import type { ScreenConfigFormData } from './ScreenConfig';
import { useTranslation } from 'react-i18next';
import {
  PosSwitchList,
  PosSwitchRow,
} from '@/pos/components/pos-edit/PosSwitchRow';
import { usePosSettingsLabels } from '@/pos/hooks/usePosSettingsLabels';

interface KitchenScreenProps {
  control: Control<ScreenConfigFormData>;
}

const FIELD_LABEL_CLASS_NAME = 'text-sm font-medium';

export const KitchenScreen: React.FC<KitchenScreenProps> = ({ control }) => {
  const { t } = useTranslation('sales');
  const labels = usePosSettingsLabels();
  const kitchenType = useWatch({ control, name: 'kitchenType' });
  const showTypeOptions = [
    { value: 'all', label: t('all-saved-orders') },
    { value: 'paid', label: t('paid-all-orders') },
    { value: 'defined', label: t('defined-orders-only') },
  ];
  const statusChangeOptions = [
    { value: 'manual', label: t('manual') },
    { value: 'time', label: t('time') },
  ];

  return (
    <PosSwitchList>
      <PosSwitchRow
        control={control}
        name="kitchenIsActive"
        label={t('kitchen-screen')}
        description={labels.kitchenScreenDescription}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Controller
            name="kitchenShowType"
            control={control}
            render={({ field }) => (
              <div className="min-w-0 space-y-2">
                <Label variant="peer" className={FIELD_LABEL_CLASS_NAME}>
                  {labels.showTypes}
                </Label>
                <Select value={field.value} onValueChange={field.onChange}>
                  <Select.Trigger>
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Content>
                    {showTypeOptions.map((opt) => (
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
            name="kitchenType"
            control={control}
            render={({ field }) => (
              <div className="min-w-0 space-y-2">
                <Label variant="peer" className={FIELD_LABEL_CLASS_NAME}>
                  {labels.statusChange}
                </Label>
                <Select value={field.value} onValueChange={field.onChange}>
                  <Select.Trigger>
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Content>
                    {statusChangeOptions.map((opt) => (
                      <Select.Item key={opt.value} value={opt.value}>
                        {opt.label}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              </div>
            )}
          />
          {kitchenType === 'time' && (
            <Controller
              name="kitchenValue"
              control={control}
              render={({ field }) => (
                <div className="min-w-0 space-y-2">
                  <Label variant="peer" className={FIELD_LABEL_CLASS_NAME}>
                    {labels.timeMinute}
                  </Label>
                  <Input
                    type="number"
                    {...field}
                    value={field.value || ''}
                    placeholder={t('enter-time-in-minutes')}
                  />
                </div>
              )}
            />
          )}
        </div>
      </PosSwitchRow>
    </PosSwitchList>
  );
};
