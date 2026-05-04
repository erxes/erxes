import { SelectAccount } from '@/settings/account/components/SelectAccount';
import { IAccount } from '@/settings/account/types/Account';
import { CurrencyField, Form, Input, Select } from 'erxes-ui';
import { useWatch } from 'react-hook-form';
import { SelectBranches, SelectDepartments, SelectMember } from 'ui-modules';
import { ICommonFieldProps } from '../types/JournalForms';

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
          <Form.Label>{labelTxt || 'Данс'}</Form.Label>
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
  sides,
  labelTxt,
}: ICommonFieldProps & {
  sides: {
    label: string;
    value: string;
  }[];
}) => (
  <Form.Field
    control={form.control}
    name={`trDocs.${index}.side`}
    render={({ field }) => (
      <Form.Item>
        <Form.Label>{labelTxt || 'Тал'}</Form.Label>
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

export const AmountField = ({
  form,
  index,
  detIndex,
  labelTxt,
}: ICommonFieldProps) => (
  <Form.Field
    control={form.control}
    name={`trDocs.${index}.details.${detIndex ?? 0}.amount`}
    render={({ field }) => (
      <Form.Item>
        <Form.Label>{labelTxt || 'Дүн'}</Form.Label>
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

export const AssignToField = ({ form, index, labelTxt }: ICommonFieldProps) => (
  <Form.Field
    control={form.control}
    name={`trDocs.${index}.assignedUserIds`}
    render={({ field }) => (
      <Form.Item>
        <Form.Label>{labelTxt || 'Хариуцагч'}</Form.Label>
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

export const BranchField = ({ form, index, labelTxt }: ICommonFieldProps) => {
  const details = useWatch({
    control: form.control,
    name: `trDocs.${index}.details`,
  });

  const onChangeBranch = (branchId: string[] | string | undefined) => {
    form.setValue(`trDocs.${index}.branchId`, branchId as string);
    details.forEach((_d, ind) => {
      form.setValue(
        `trDocs.${index}.details.${ind}.branchId`,
        branchId as string,
      );
    });
  };

  return (
    <Form.Field
      control={form.control}
      name={`trDocs.${index}.branchId`}
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{labelTxt || 'Салбар'}</Form.Label>
          <Form.Control>
            <SelectBranches.FormItem
              mode="single"
              value={field.value ?? ''}
              onValueChange={onChangeBranch}
            />
          </Form.Control>
          <Form.Message />
        </Form.Item>
      )}
    />
  );
};

export const DepartmentField = ({
  form,
  index,
  labelTxt,
}: ICommonFieldProps) => {
  const details = useWatch({
    control: form.control,
    name: `trDocs.${index}.details`,
  });

  const onChangeDepartment = (departmentId: string[] | string | undefined) => {
    form.setValue(`trDocs.${index}.departmentId`, departmentId as string);
    details.forEach((_d, ind) => {
      form.setValue(
        `trDocs.${index}.details.${ind}.departmentId`,
        departmentId as string,
      );
    });
  };

  return (
    <Form.Field
      control={form.control}
      name={`trDocs.${index}.departmentId`}
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{labelTxt || 'Хэлтэс'}</Form.Label>
          <Form.Control>
            <SelectDepartments.FormItem
              mode="single"
              value={field.value ?? ''}
              onValueChange={onChangeDepartment}
            />
          </Form.Control>
          <Form.Message />
        </Form.Item>
      )}
    />
  );
};

export const DescriptionField = ({
  form,
  index,
  labelTxt,
}: ICommonFieldProps) => (
  <Form.Field
    control={form.control}
    name={`trDocs.${index}.description`}
    render={({ field }) => (
      <Form.Item>
        <Form.Label>{labelTxt || 'Тайлбар'}</Form.Label>
        <Form.Control>
          <Input {...field} value={field.value ?? ''} />
        </Form.Control>
        <Form.Message />
      </Form.Item>
    )}
  />
);

export const BankField = ({ form, index }: ICommonFieldProps) => {
  return (
    <>
      <Form.Field
        control={form.control}
        name={`trDocs.${index}.extraData.bank`}
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Банк</Form.Label>
            <Form.Control>
              <Input
                placeholder="Банкны нэр оруулах"
                value={field.value ?? ''}
                onChange={field.onChange}
              />
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
            <Form.Label>Банкны данс</Form.Label>
            <Form.Control>
              <Input
                placeholder="Банкны дансны дугаар оруулах"
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
