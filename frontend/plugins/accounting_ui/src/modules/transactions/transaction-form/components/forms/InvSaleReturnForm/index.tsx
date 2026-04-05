import { SelectAccount } from '@/settings/account/components/SelectAccount';
import { AccountKind, IAccount, JournalEnum } from '@/settings/account/types/Account';
import { IconBookDownload } from '@tabler/icons-react';
import { Button, Form } from 'erxes-ui';
import { useAtom } from 'jotai';
import { useWatch } from 'react-hook-form';
import { followTrDocsState } from '../../../states/trStates';
import { ITransactionGroupForm, TInvSaleJournal, TInvSaleReturnJournal } from '../../../types/JournalForms';
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
import { SelectSaleSheet } from './SelectSaleSheet';
import { ITransaction, ITrDetail } from '~/modules/transactions/types/Transaction';
import { CustomerType } from 'ui-modules';
import { TR_SIDES } from '~/modules/transactions/types/constants';
import { useState } from 'react';

export const InvSaleReturnForm = ({
  form,
  index,
}: {
  form: ITransactionGroupForm;
  index: number;
}) => {
  const trDoc = useWatch({
    control: form.control,
    name: `trDocs.${index}`,
  }) as TInvSaleReturnJournal;

  const [followTrDocs, setFollowTrDocs] = useAtom(followTrDocsState);
  const [replaceDetails, setReplaceDetails] = useState<ITrDetail[]>(trDoc.details as any[]);
  const onChangeOutAccount = (account: IAccount) => {
    form.setValue(
      `trDocs.${index}.followExtras.saleOutAccount`,
      account,
    );

    setFollowTrDocs((followTrDocs || []).map((ftr) => (
      ftr.originId === trDoc._id &&
      ftr.originType === 'invSaleReturnOut'
    ) && {
      ...ftr,
      details: ftr.details.map(ftrd => ({
        ...ftrd, account, accountId: account._id
      }))
    } || ftr));
  };

  const onChangeCostAccount = (account: IAccount) => {
    form.setValue(
      `trDocs.${index}.followExtras.saleCostAccount`,
      account,
    );

    setFollowTrDocs((followTrDocs || []).map((ftr) => (
      ftr.originId === trDoc._id &&
      ftr.originType === 'invSaleReturnCost'
    ) && {
      ...ftr,
      details: ftr.details.map(ftrd => ({
        ...ftrd, account, accountId: account._id
      }))
    } || ftr));
  };

  const onChangeSaleTr = (saleTrId: string, saleTr?: ITransaction) => {
    if (saleTr) {
      const sale: TInvSaleJournal = saleTr as TInvSaleJournal;
      const details = sale.details.map((saleDet) => ({
        ...saleDet,
        side: TR_SIDES.DEBIT,
      }));

      form.setValue(`trDocs.${index}`, {
        ...trDoc,
        customerType: sale?.customerType as CustomerType,
        customerId: sale.customerId,
        followInfos: { ...trDoc.followInfos, ...sale.followInfos, saleTransactionId: saleTrId },
        branchId: sale.branchId,
        departmentId: sale.departmentId,
        hasVat: sale.hasVat,
        hasCtax: sale.hasCtax,
        details
      }, {
        shouldDirty: true,
        shouldValidate: true,
      })
      setReplaceDetails(details as ITrDetail[])
    }
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6">
        <CustomerFields form={form} index={index} />
        <DescriptionField form={form} index={index} />
        <AssignToField form={form} index={index} />
        <SelectSaleSheet
          saleTrId={trDoc.followInfos?.saleTransactionId || ''}
          onSelect={onChangeSaleTr}
        >
          <Form.Item>
            <Form.Label>Sale Transaction</Form.Label>
            <Form.Control>
              <Button variant="ghost" className="">
                <IconBookDownload />
                {trDoc.followInfos?.saleTransactionId || 'Select Sale Transaction'}
              </Button>
            </Form.Control>
            <Form.Message />
          </Form.Item>

        </SelectSaleSheet>
        <AccountField
          form={form}
          index={index}
          filter={{ journals: [JournalEnum.INV_FOLLOW], kind: AccountKind.PASSIVE }}
          allDetails={true}
          labelTxt='Sale Account'
        />
        <BranchField form={form} index={index} />
        <DepartmentField form={form} index={index} />
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
                  defaultFilter={{ journals: [JournalEnum.INV_FOLLOW], kind: AccountKind.ACTIVE }}
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
        replaceDetails={replaceDetails}
      />
    </>
  );
};

