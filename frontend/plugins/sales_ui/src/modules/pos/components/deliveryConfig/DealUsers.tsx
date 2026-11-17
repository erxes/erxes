import { Control, Controller } from 'react-hook-form';
import { Label, Combobox, PopoverScoped } from 'erxes-ui';
import { SelectMember, SelectProduct } from 'ui-modules';
import type { DeliveryConfigFormData } from './DeliveryConfig';
import { useTranslation } from 'react-i18next';
import { usePosSettingsLabels } from '@/pos/hooks/usePosSettingsLabels';

interface DealUsersProps {
  control: Control<DeliveryConfigFormData>;
}

export const DealUsers: React.FC<DealUsersProps> = ({ control }) => {
  const { t } = useTranslation('sales');
  const labels = usePosSettingsLabels();
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Controller
        name="watchedUserIds"
        control={control}
        render={({ field }) => (
          <div className="min-w-0 space-y-2">
            <Label variant="peer" className="text-sm font-medium">
              {labels.watchedUsers}
            </Label>
            <SelectMember.Provider
              value={field.value}
              onValueChange={field.onChange}
              mode="multiple"
            >
              <PopoverScoped>
                <Combobox.Trigger className="w-full h-8">
                  <SelectMember.Value placeholder={t('choose-team-member')} />
                </Combobox.Trigger>
                <Combobox.Content>
                  <SelectMember.Content />
                </Combobox.Content>
              </PopoverScoped>
            </SelectMember.Provider>
          </div>
        )}
      />

      <Controller
        name="assignedUserIds"
        control={control}
        render={({ field }) => (
          <div className="min-w-0 space-y-2">
            <Label variant="peer" className="text-sm font-medium">
              {labels.assignedUsers}
            </Label>
            <SelectMember.Provider
              value={field.value}
              onValueChange={field.onChange}
              mode="multiple"
            >
              <PopoverScoped>
                <Combobox.Trigger className="w-full h-8">
                  <SelectMember.Value placeholder={t('choose-team-member')} />
                </Combobox.Trigger>
                <Combobox.Content>
                  <SelectMember.Content />
                </Combobox.Content>
              </PopoverScoped>
            </SelectMember.Provider>
          </div>
        )}
      />

      <Controller
        name="productId"
        control={control}
        render={({ field }) => (
          <div className="min-w-0 space-y-2 md:col-span-2">
            <Label variant="peer" className="text-sm font-medium">
              {labels.deliveryProduct}
            </Label>
            <SelectProduct
              value={field.value}
              onValueChange={(value) => {
                const id = Array.isArray(value) ? value[0] : value;
                field.onChange(id || '');
              }}
              mode="single"
              placeholder={t('choose-delivery-product')}
            />
          </div>
        )}
      />
    </div>
  );
};
