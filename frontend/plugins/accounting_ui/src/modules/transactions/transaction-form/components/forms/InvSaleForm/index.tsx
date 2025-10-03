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
import { CtaxForm } from '../../helpers/CtaxForm';
import { CustomerFields } from '../../helpers/CustomerFields';
import { VatForm } from '../../helpers/VatForm';
import { InventoryForm } from './InventoryForm';

export const InvSaleForm = ({
  form,
  index,
}: {
  form: ITransactionGroupForm;
  index: number;
}) => {
  const onChangeOutAccount = (account: IAccount) => {
    form.setValue(
      `trDocs.${index}.followExtras.saleOutAccount`,
      account as any,
    );
  };

  const onChangeCostAccount = (account: IAccount) => {
    form.setValue(
      `trDocs.${index}.followExtras.saleCostAccount`,
      account as any,
    );
  };

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6">
        <AccountField
          form={form}
          index={index}
          filter={{ journals: [JournalEnum.MAIN] }}
          allDetails={true}
          labelTxt='Sale Account'
        />
        <CustomerFields form={form} index={index} />
        <BranchField form={form} index={index} />
        <DepartmentField form={form} index={index} />
        <AssignToField form={form} index={index} />
        <DescriptionField form={form} index={index} />
        <Form.Field
          control={form.control}
          name={`trDocs.${index}.followInfos.saleOutAccountId`}
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Inventory Account</Form.Label>
              <Form.Control>
                <SelectAccount
                  value={field.value || ''}
                  onValueChange={field.onChange}
                  defaultFilter={{ journals: [JournalEnum.INVENTORY] }}
                  onCallback={(account) => onChangeOutAccount(account)}
                />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name={`trDocs.${index}.followInfos.saleCostAccountId`}
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Cost Account</Form.Label>
              <Form.Control>
                <SelectAccount
                  value={field.value || ''}
                  onValueChange={field.onChange}
                  defaultFilter={{ journals: [JournalEnum.MAIN] }}
                  onCallback={(account) => onChangeCostAccount(account)}
                />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <VatForm form={form} journalIndex={index} isWithTax={false} isSameSide={true} />
        <CtaxForm form={form} journalIndex={index} isWithTax={false} isSameSide={true} />
      </div>

      <InventoryForm
        form={form}
        journalIndex={index}
      />
    </>
  );
};

