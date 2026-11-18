import { IconDiscount, IconUsers } from '@tabler/icons-react';
import { Form, Input } from 'erxes-ui';
import { type Control } from 'react-hook-form';
import { SelectMember } from 'ui-modules';
import { type PermissionFormData } from '@/pos/components/permission/Permission';
import {
  PosSwitchList,
  PosSwitchRow,
} from '@/pos/components/pos-edit/PosSwitchRow';
import { PosFieldRow } from '@/pos/components/pos-edit/PosFieldRow';
import { POS_PANEL_INPUT_CLASS_NAME } from '@/pos/constants/posPanel';
import { usePosSettingsLabels } from '@/pos/hooks/usePosSettingsLabels';
import { toIds } from '@/pos/utils/toIds';

interface RolePermissionsProps {
  control: Control<PermissionFormData>;
  kind: 'admin' | 'cashier';
}

export const RolePermissions = ({ control, kind }: RolePermissionsProps) => {
  const labels = usePosSettingsLabels();

  return (
    <div className="space-y-2">
      <Form.Field
        control={control}
        name={`${kind}Ids`}
        render={({ field }) => (
          <PosFieldRow label={labels.members} icon={IconUsers} required>
            <SelectMember
              value={field.value}
              onValueChange={(value) => field.onChange(toIds(value))}
              mode="multiple"
            />
          </PosFieldRow>
        )}
      />
      <PosSwitchList>
        <PosSwitchRow
          control={control}
          name={`${kind}IsPrintTempBill`}
          label={labels.printTempBill}
          description={labels.printTempBillDescription}
        />
        {kind === 'cashier' && (
          <>
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
          </>
        )}
        <PosSwitchRow
          control={control}
          name={`${kind}DirectDiscount`}
          label={labels.directDiscount}
          description={labels.directDiscountDescription}
        >
          <Form.Field
            control={control}
            name={`${kind}DirectDiscountLimit`}
            render={({ field }) => (
              <PosFieldRow
                label={labels.directDiscountLimit}
                icon={IconDiscount}
                description={labels.directDiscountLimitDescription}
              >
                <Input
                  type="number"
                  className={POS_PANEL_INPUT_CLASS_NAME}
                  {...field}
                />
              </PosFieldRow>
            )}
          />
        </PosSwitchRow>
      </PosSwitchList>
    </div>
  );
};
