import { ICommonFieldProps } from '../types/JournalForms';
import { CurrencyField, Form, Input, Select } from 'erxes-ui';
import { SelectAccount } from '@/settings/account/components/SelectAccount';
import { SelectBranches, SelectDepartments, SelectMember } from 'ui-modules';
import { IAccount } from '@/settings/account/types/Account';
import { useWatch } from 'react-hook-form';
import { BankEnum } from '@/settings/account/types/Account';

export const AccountField = ({
  form,
  index,
  detIndex,
  filter,
  allDetails,
  labelTxt,
}: ICommonFieldProps & {
  filter?: any;
  allDetails?: boolean;
  labelTxt?: string;
}) => {
  const details = useWatch({
    control: form.control,
    name: `trDocs.${index}.details`,
  });
  const onChangeAccount = (account: IAccount) => {
    if (allDetails) {
      details.forEach((_d, ind) => {
        form.setValue(`trDocs.${index}.details.${ind}.account`, account as any);
        form.setValue(
          `trDocs.${index}.details.${ind}.accountId`,
          account._id as any,
        );
      });
    } else {
      form.setValue(
        `trDocs.${index}.details.${detIndex ?? 0}.account`,
        account as any,
      );
    }

    if (account?.branchId) {
      form.setValue(`trDocs.${index}.branchId`, account.branchId);
    }

    if (account?.departmentId) {
      form.setValue(`trDocs.${index}.departmentId`, account.departmentId);
    }
  };

  return (
    <Form.Field
      control={form.control}
      name={`trDocs.${index}.details.${detIndex ?? 0}.accountId`}
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{labelTxt || 'Account'}</Form.Label>
          <Form.Control>
            <SelectAccount
              value={field.value || ''}
              onValueChange={field.onChange}
              onCallback={onChangeAccount}
              defaultFilter={{ ...filter }}
            />
          </Form.Control>
          <Form.Message />
        </Form.Item>
      )}
    />
  );
};

export const SideField = ({
  form,
  index,
  detIndex,
  sides,
}: ICommonFieldProps & {
  sides: {
    label: string;
    value: string;
  }[];
}) => (
  <Form.Field
    control={form.control}
    name={`trDocs.${index}.details.${detIndex ?? 0}.side`}
    render={({ field }) => (
      <Form.Item>
        <Form.Label>Side</Form.Label>
        <Select value={field.value} onValueChange={field.onChange}>
          <Form.Control>
            <Select.Trigger className="h-8">
              <Select.Value />
            </Select.Trigger>
          </Form.Control>
          <Select.Content>
            {sides.map((side) => (
              <Select.Item key={side.value} value={side.value}>
                {side.label}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
      </Form.Item>
    )}
  />
);

export const AmountField = ({ form, index, detIndex }: ICommonFieldProps) => (
  <Form.Field
    control={form.control}
    name={`trDocs.${index}.details.${detIndex ?? 0}.amount`}
    render={({ field }) => (
      <Form.Item>
        <Form.Label>Amount</Form.Label>
        <Form.Control>
          <CurrencyField.ValueInput
            value={field.value}
            onChange={field.onChange}
          />
        </Form.Control>
      </Form.Item>
    )}
  />
);

export const AssignToField = ({ form, index }: ICommonFieldProps) => (
  <Form.Field
    control={form.control}
    name={`trDocs.${index}.assignedUserIds`}
    render={({ field }) => (
      <Form.Item>
        <Form.Label>Assign To</Form.Label>
        <Form.Control>
          <SelectMember.FormItem
            onValueChange={(users) => field.onChange(users || [])}
            value={field.value}
            mode="multiple"
          />
        </Form.Control>
        <Form.Message />
      </Form.Item>
    )}
  />
);

export const BranchField = ({ form, index }: ICommonFieldProps) => (
  <Form.Field
    control={form.control}
    name={`trDocs.${index}.branchId`}
    render={({ field }) => (
      <Form.Item>
        <Form.Label>Branch</Form.Label>
        <Form.Control>
          <SelectBranches.FormItem
            mode="single"
            value={field.value ?? ''}
            onValueChange={(branch) => field.onChange(branch)}
          />
        </Form.Control>
        <Form.Message />
      </Form.Item>
    )}
  />
);

export const DepartmentField = ({ form, index }: ICommonFieldProps) => (
  <Form.Field
    control={form.control}
    name={`trDocs.${index}.departmentId`}
    render={({ field }) => (
      <Form.Item>
        <Form.Label>Department</Form.Label>
        <Form.Control>
          <SelectDepartments.FormItem
            mode="single"
            value={field.value ?? ''}
            onValueChange={(department) => field.onChange(department)}
          />
        </Form.Control>
        <Form.Message />
      </Form.Item>
    )}
  />
);

export const DescriptionField = ({ form, index }: ICommonFieldProps) => (
  <Form.Field
    control={form.control}
    name={`trDocs.${index}.description`}
    render={({ field }) => (
      <Form.Item>
        <Form.Label>Description</Form.Label>
        <Form.Control>
          <Input {...field} value={field.value ?? ''} />
        </Form.Control>
        <Form.Message />
      </Form.Item>
    )}
  />
);

export const BankField = ({ form, index }: ICommonFieldProps) => {
  const BANK_OPTIONS = [
    { label: 'Xac Bank', value: BankEnum.XAC },
    { label: 'Golomt Bank', value: BankEnum.GOLOMT },
    { label: 'Khan Bank', value: BankEnum.KHAN },
    { label: 'TDB', value: BankEnum.TDB },
  ];
  return (
    <>
      <Form.Field
        control={form.control}
        name={`trDocs.${index}.extraData.bank`}
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Bank</Form.Label>
            <Form.Control>
              <Select value={field.value} onValueChange={field.onChange}>
                <Select.Trigger>
                  <Select.Value placeholder="Select bank" />
                </Select.Trigger>
                <Select.Content>
                  {BANK_OPTIONS.map((bank) => (
                    <Select.Item key={bank.value} value={bank.value}>
                      {bank.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />

      <Form.Field
        control={form.control}
        name={`trDocs.${index}.extraData.bankAccount`}
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Bank Account</Form.Label>
            <Form.Control>
              <Input
                placeholder="Enter bank account number"
                value={field.value ?? ''}
                onChange={field.onChange}
              />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
    </>
  );
};
