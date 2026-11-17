import { Form, Input } from 'erxes-ui';
import { type Control } from 'react-hook-form';
import { SelectMember } from 'ui-modules';
import { type PermissionFormData } from '@/pos/components/permission/Permission';
import {
  PosSwitchList,
  PosSwitchRow,
} from '@/pos/components/pos-edit/PosSwitchRow';
import { usePosSettingsLabels } from '@/pos/hooks/usePosSettingsLabels';

interface CashierPermissionsProps {
  control: Control<PermissionFormData>;
}

export const CashierPermissions: React.FC<CashierPermissionsProps> = ({
  control,
}) => {
  const labels = usePosSettingsLabels();

  return (
    <div className="space-y-4">
      <Form.Field
        control={control}
        name="cashierIds"
        render={({ field }) => (
          <Form.Item>
            <Form.Label variant="peer" className="text-sm font-medium">
              {labels.members} <span className="text-destructive">*</span>
            </Form.Label>
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
      <PosSwitchList>
        <PosSwitchRow
          control={control}
          name="cashierIsPrintTempBill"
          label={labels.printTempBill}
          description={labels.printTempBillDescription}
        />
        <PosSwitchRow
          control={control}
          name="cashierSeeReport"
          label={labels.seeReport}
          description={labels.seeReportDescription}
        />
        <PosSwitchRow
          control={control}
          name="cashierCreateCustomer"
          label={labels.createCustomer}
          description={labels.createCustomerDescription}
        />
        <PosSwitchRow
          control={control}
          name="cashierDirectDiscount"
          label={labels.directDiscount}
          description={labels.directDiscountDescription}
        >
          <Form.Field
            control={control}
            name="cashierDirectDiscountLimit"
            render={({ field }) => (
              <Form.Item>
                <Form.Label variant="peer" className="text-sm font-medium">
                  {labels.directDiscountLimit}
                </Form.Label>
                <Form.Control>
                  <Input type="number" className="max-w-40" {...field} />
                </Form.Control>
                <Form.Description>
                  {labels.directDiscountLimitDescription}
                </Form.Description>
              </Form.Item>
            )}
          />
        </PosSwitchRow>
      </PosSwitchList>
    </div>
  );
};
