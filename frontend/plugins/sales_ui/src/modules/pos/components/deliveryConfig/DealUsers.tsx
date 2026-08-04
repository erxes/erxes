import { Control, Controller } from 'react-hook-form';
import { Label, Combobox, PopoverScoped } from 'erxes-ui';
import { SelectMember, SelectProduct } from 'ui-modules';
import type { DeliveryConfigFormData } from './DeliveryConfig';
import { useTranslation } from 'react-i18next';
import { T } from 'react-router/dist/development/fog-of-war-oa9CGk10';

interface DealUsersProps {
  control: Control<DeliveryConfigFormData>;
}

export const DealUsers: React.FC<DealUsersProps> = ({ control }) => {
  const { t } = useTranslation('sales');
  return (
    <div className="space-y-4">
      <Controller
        name="watchedUserIds"
        control={control}
        render={({ field }) => (
          <div className="space-y-2">
            <Label>{t('watched-users')}</Label>
            <SelectMember.Provider
              value={field.value}
              onValueChange={field.onChange}
              mode="multiple"
            >
              <PopoverScoped>
                <Combobox.Trigger className="w-full h-8">
                  <SelectMember.Value placeholder={t("choose-team-member")} />
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
          <div className="space-y-2">
            <Label>{t('assigned-users')}</Label>
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
          <div className="space-y-2">
            <Label>{t('delivery-product')}</Label>
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
