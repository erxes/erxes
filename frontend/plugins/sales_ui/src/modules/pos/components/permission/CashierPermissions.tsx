import { Form, Label, Input, Switch } from 'erxes-ui';
import { type Control, useWatch } from 'react-hook-form';
import { SelectMember } from 'ui-modules';
import { type PermissionFormData } from '@/pos/components/permission/Permission';

interface CashierPermissionsProps {
  control: Control<PermissionFormData>;
}

export const CashierPermissions: React.FC<CashierPermissionsProps> = ({
  control,
}) => {
  const directDiscount = useWatch({
    control,
    name: 'cashierDirectDiscount',
  });

  return (
    <div className="space-y-6">
      <Form.Field
        control={control}
        name="cashierIds"
        render={({ field }) => (
          <Form.Item>
            <Label>
              POS CASHIER <span className="text-destructive">*</span>
            </Label>

            <Form.Control>
              <SelectMember
                value={field.value}
                onValueChange={(value) => {
                  const ids = Array.isArray(value)
                    ? value
                    : value
                      ? [value]
                      : [];
                  field.onChange(ids);
                }}
                mode="multiple"
              />
            </Form.Control>
          </Form.Item>
        )}
      />

      <div className="flex flex-wrap gap-8 items-center">
        <Form.Field
          control={control}
          name="cashierIsPrintTempBill"
          render={({ field }) => (
            <Form.Item>
              <div className="flex gap-2 items-center">
                <Label className="text-xs">IS PRINT TEMP BILL</Label>
                <Form.Control>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </Form.Control>
              </div>
            </Form.Item>
          )}
        />

        <Form.Field
          control={control}
          name="cashierDirectDiscount"
          render={({ field }) => (
            <Form.Item>
              <div className="flex gap-2 items-center">
                <Label className="text-xs">DIRECT DISCOUNT</Label>
                <Form.Control>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </Form.Control>
              </div>
            </Form.Item>
          )}
        />

        {directDiscount && (
          <Form.Field
            control={control}
            name="cashierDirectDiscountLimit"
            render={({ field }) => (
              <Form.Item>
                <div className="flex gap-2 items-center">
                  <Label className="text-xs">DIRECT DISCOUNT LIMIT</Label>
                  <Form.Control>
                    <Input
                      type="number"
                      placeholder="Enter limit"
                      className="w-32 h-8"
                      {...field}
                    />
                  </Form.Control>
                </div>
              </Form.Item>
            )}
          />
        )}
      </div>
    </div>
  );
};
