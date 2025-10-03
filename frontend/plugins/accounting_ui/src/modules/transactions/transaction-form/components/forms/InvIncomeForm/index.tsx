import { JournalEnum } from '@/settings/account/types/Account';
import { fixNum } from 'erxes-ui/lib';
import { useEffect } from 'react';
import { useWatch } from 'react-hook-form';
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
import { ExpenseForm } from './ExpenseForm';
import { InventoryForm } from './InventoryForm';

export const InvIncomeForm = ({
  form,
  index,
}: {
  form: ITransactionGroupForm;
  index: number;
}) => {
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
        <VatForm form={form} journalIndex={index} isWithTax={false} isSameSide={true} />
        <CtaxForm form={form} journalIndex={index} isWithTax={false} isSameSide={true} />
      </div>

      <div className="pt-3">
        <ExpenseForm form={form} journalIndex={index} />
      </div>

      <InventoryForm
        form={form}
        journalIndex={index}
      />
      <CalcAmountEffectComponent form={form} journalIndex={index} />
    </>
  );
};

const CalcAmountEffectComponent = ({
  form,
  journalIndex,
}: {
  form: ITransactionGroupForm;
  journalIndex: number;
}) => {
  const expenses = useWatch({
    control: form.control,
    name: `trDocs.${journalIndex}.extraData.invIncomeExpenses`,
  });
  const details = useWatch({
    control: form.control,
    name: `trDocs.${journalIndex}.details`,
  });

  const sumAmountExpenses = expenses?.filter(ex => ex.rule === 'amount').reduce((sum, cur) => fixNum(sum + (cur.amount ?? 0)), 0);
  const sumCountExpenses = expenses?.filter(ex => ex.rule === 'count').reduce((sum, cur) => fixNum(sum + (cur.amount ?? 0)), 0);

  const sumAmountDetails = details.reduce((sum, cur) => fixNum(sum + (cur.count ?? 0) * (cur.unitPrice ?? 0)), 0);
  const sumCountDetails = details.reduce((sum, cur) => fixNum(sum + (cur.count ?? 0)), 0);

  useEffect(() => {
    const proportionAmount = sumAmountExpenses / sumAmountDetails;
    const proportionCount = sumCountExpenses / sumCountDetails;

    details.forEach((detail, detIndex) => {
      const amount = fixNum((detail.count ?? 0) * (detail.unitPrice ?? 0));
      const newAmount = amount + fixNum(proportionCount * (detail.count ?? 0)) + fixNum(proportionAmount * amount);
      form.setValue(`trDocs.${journalIndex}.details.${detIndex}.amount`, newAmount);
    });
  },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sumAmountDetails, sumAmountExpenses, sumCountDetails, sumCountExpenses]
  )
  return null
}
