import { Control, Controller } from 'react-hook-form';
import { Label, Switch, Select, Input } from 'erxes-ui';
import type { ScreenConfigFormData } from './ScreenConfig';
import { useTranslation } from 'react-i18next';

interface WaitingScreenProps {
  control: Control<ScreenConfigFormData>;
}

export const WaitingScreen: React.FC<WaitingScreenProps> = ({ control }) => {
  const { t } = useTranslation('sales');
  const changeTypeOptions = [
    { value: 'time', label: t('time') },
    { value: 'count', label: t('count') },
  ];
  return (
    <div className="space-y-4">
      <Controller
        name="waitingIsActive"
        control={control}
        render={({ field }) => (
          <div className="flex gap-2 items-center">
            <Switch checked={field.value} onCheckedChange={field.onChange} />
            <Label>{t('WAITING-SCREEN')}</Label>
          </div>
        )}
      />

      <Controller
        name="waitingIsActive"
        control={control}
        render={({ field }) =>
          field.value ? (
            <div className="pt-2 space-y-4">
              <Controller
                name="waitingType"
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    <Label>{t('CHANGE-TYPE')}</Label>
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
                name="waitingType"
                control={control}
                render={({ field: typeField }) => (
                  <Controller
                    name="waitingValue"
                    control={control}
                    render={({ field }) => (
                      <div className="space-y-2">
                        <Label>
                          {typeField.value === 'time'
                            ? t('CHANGE-TIME-MIN')
                            : t('CHANGE-COUNT')}
                        </Label>
                        <Input
                          type="number"
                          {...field}
                          value={field.value || ''}
                          placeholder={
                            typeField.value === 'time'
                              ? t('enter-time-in-minutes')
                              : t('enter-count')
                          }
                        />
                      </div>
                    )}
                  />
                )}
              />

              <Controller
                name="waitingContentUrl"
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    <Label>{t('CONTENT-URL')}</Label>
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
          ) : (
            <></>
          )
        }
      />
    </div>
  );
};
