import { Control, Controller } from 'react-hook-form';
import { Label, Switch, Select, Input } from 'erxes-ui';
import type { ScreenConfigFormData } from './ScreenConfig';
import { useTranslation } from 'react-i18next';

interface KitchenScreenProps {
  control: Control<ScreenConfigFormData>;
}

export const KitchenScreen: React.FC<KitchenScreenProps> = ({ control }) => {
  const { t } = useTranslation('sales');
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
    <div className="space-y-4">
      <Controller
        name="kitchenIsActive"
        control={control}
        render={({ field }) => (
          <div className="flex gap-2 items-center">
            <Switch checked={field.value} onCheckedChange={field.onChange} />
            <Label>{t('KITCHEN-SCREEN')}</Label>
          </div>
        )}
      />

      <Controller
        name="kitchenIsActive"
        control={control}
        render={({ field }) =>
          field.value ? (
            <div className="pt-2 space-y-4">
              <Controller
                name="kitchenShowType"
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    <Label>{t('SHOW-TYPES')}</Label>
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
                  <div className="space-y-2">
                    <Label>{t('STATUS-CHANGE-LEAVE')}</Label>
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

              <Controller
                name="kitchenType"
                control={control}
                render={({ field }) =>
                  field.value === 'time' ? (
                    <Controller
                      name="kitchenValue"
                      control={control}
                      render={({ field }) => (
                        <div className="space-y-2">
                          <Label>{t('TIME-MINUTE')}</Label>
                          <Input
                            type="number"
                            {...field}
                            value={field.value || ''}
                            placeholder={t('enter-time-in-minutes')}
                          />
                        </div>
                      )}
                    />
                  ) : (
                    <></>
                  )
                }
              />
            </div>
          ) : (
            <></>
          )
        }
      />
    </div>
  );
};
