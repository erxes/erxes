import { SelectBranches, SelectDepartments, } from 'ui-modules';
import { SelectAccount } from '@/settings/account/components/SelectAccount';
import { IAccount, JournalEnum } from '@/settings/account/types/Account';
import { Form } from 'erxes-ui';
import { ITransactionGroupForm } from '../../../types/JournalForms';
import {
  AccountField,
  AssignToField,
  BranchField,
  DepartmentField,
  DescriptionField,
} from '../../GeneralFormFields';
import { CustomerFields } from '../../helpers/CustomerFields';
import { InventoryForm } from './InventoryForm';

export const InvMoveForm = ({
  form,
  index,
}: {
  form: ITransactionGroupForm;
  index: number;
}) => {
  const onChangeInAccount = (account: IAccount) => {
    form.setValue(
      `trDocs.${index}.followExtras.moveInAccount`,
      account as any,
    );
  };

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6">
        <AccountField
          form={form}
          index={index}
          filter={{ journals: [JournalEnum.INVENTORY] }}
          allDetails={true}
        />
        <CustomerFields form={form} index={index} />
        <BranchField form={form} index={index} />
        <DepartmentField form={form} index={index} />
        <AssignToField form={form} index={index} />
        <DescriptionField form={form} index={index} />
        <Form.Field
          control={form.control}
          name={`trDocs.${index}.followInfos.moveInAccountId`}
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Move incoming Account</Form.Label>
              <Form.Control>
                <SelectAccount
                  value={field.value || ''}
                  onValueChange={field.onChange}
                  defaultFilter={{ journals: [JournalEnum.INVENTORY] }}
                  onCallback={(account) => onChangeInAccount(account)}
                />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
            control={form.control}
            name={`trDocs.${index}.followInfos.moveInBranchId`}
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Move incoming Branch</Form.Label>
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
        <Form.Field
            control={form.control}
            name={`trDocs.${index}.followInfos.moveInDepartmentId`}
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Move incoming Department</Form.Label>
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
      </div>

      <InventoryForm
        form={form}
        journalIndex={index}
      />
    </>
  );
};
