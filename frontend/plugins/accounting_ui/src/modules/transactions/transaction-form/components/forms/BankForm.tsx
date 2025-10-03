import { JournalEnum } from '@/settings/account/types/Account';
import { TR_SIDES } from '../../../types/constants';
import { ITransactionGroupForm } from '../../types/JournalForms';
import { CtaxForm } from '../helpers/CtaxForm';
import { CurrencyForm } from '../helpers/CurrencyForm';
import { VatForm } from '../helpers/VatForm';
import { CustomerFields } from '../helpers/CustomerFields';
import {
  AccountField,
  AmountField,
  AssignToField,
  BranchField,
  DepartmentField,
  DescriptionField,
  SideField,
} from './../GeneralFormFields';

export const BankTransaction = ({
  form,
  index,
}: {
  form: ITransactionGroupForm;
  index: number;
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-6">
      <AccountField form={form} index={index} filter={{ journals: [JournalEnum.BANK] }} />
      <SideField form={form} index={index} sides={TR_SIDES.FUND_OPTIONS} />
      <AmountField form={form} index={index} />
      <CustomerFields form={form} index={index} />
      <AssignToField form={form} index={index} />
      <BranchField form={form} index={index} />
      <DepartmentField form={form} index={index} />
      <DescriptionField form={form} index={index} />
      <CurrencyForm form={form} journalIndex={index} />
      <VatForm form={form} journalIndex={index} isWithTax={true} isSameSide={false} />
      <CtaxForm form={form} journalIndex={index} isWithTax={true} isSameSide={false} />
    </div>
  );
};
