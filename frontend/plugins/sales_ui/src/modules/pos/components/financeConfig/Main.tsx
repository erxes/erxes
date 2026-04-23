import { Control, Controller } from 'react-hook-form';
import { Label, Switch, Input, Select } from 'erxes-ui';
import { options } from '@/pos/constants';
import type { FinanceConfigFormData } from './FinanceConfig';
import type { PaymentType } from '@/pos/types';

interface MainProps {
  control: Control<FinanceConfigFormData>;
  isSyncErkhet: boolean;
  paymentTypes: PaymentType[];
}

export const Main: React.FC<MainProps> = ({
  control,
  isSyncErkhet,
  paymentTypes,
}) => {
  return (
    <div className="space-y-6">
      <Controller
        name="isSyncErkhet"
        control={control}
        render={({ field }) => (
          <div className="flex flex-col space-y-2">
            <Label>IS SYNC ERKHET</Label>
            <Switch checked={field.value} onCheckedChange={field.onChange} />
          </div>
        )}
      />

      {isSyncErkhet && (
        <div className="pt-4 space-y-4 border-t">
          <div className="grid grid-cols-3 gap-4">
            <Controller
              name="userEmail"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Label>USER EMAIL</Label>
                  <Input
                    {...field}
                    type="email"
                    value={field.value || ''}
                    placeholder="Enter user email"
                  />
                </div>
              )}
            />

            <Controller
              name="beginNumber"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Label>BEGIN BILL NUMBER</Label>
                  <Input
                    {...field}
                    value={field.value || ''}
                    placeholder="Enter begin number"
                  />
                </div>
              )}
            />

            <Controller
              name="defaultPay"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Label>DEFAULTPAY</Label>
                  <Select
                    value={field.value || ''}
                    onValueChange={field.onChange}
                  >
                    <Select.Trigger className="w-full">
                      <Select.Value placeholder="Select default pay" />
                    </Select.Trigger>
                    <Select.Content>
                      {options.map((opt) => (
                        <Select.Item key={opt.value} value={opt.value}>
                          {opt.label}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
                </div>
              )}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Controller
              name="account"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Label>ACCOUNT</Label>
                  <Input
                    {...field}
                    value={field.value || ''}
                    placeholder="Enter account"
                  />
                </div>
              )}
            />

            <Controller
              name="location"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Label>LOCATION</Label>
                  <Input
                    {...field}
                    value={field.value || ''}
                    placeholder="Enter location"
                  />
                </div>
              )}
            />
          </div>

          {paymentTypes.length > 0 && (
            <div className="grid grid-cols-3 gap-4">
              {paymentTypes.map((pt) => (
                <Controller
                  key={pt.type}
                  name="paymentTypeConfigs"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-2">
                      <Label>{pt.title}</Label>
                      <Select
                        value={field.value?.[`_${pt.type}`] || ''}
                        onValueChange={(val) => {
                          field.onChange({
                            ...field.value,
                            [`_${pt.type}`]: val,
                          });
                        }}
                      >
                        <Select.Trigger className="w-full">
                          <Select.Value placeholder="Select account" />
                        </Select.Trigger>
                        <Select.Content>
                          {options.map((opt) => (
                            <Select.Item key={opt.value} value={opt.value}>
                              {opt.label}
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select>
                    </div>
                  )}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
