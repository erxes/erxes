import { JournalEnum } from '@/settings/account/types/Account';
import { ITransactionGroupForm } from '../../../types/JournalForms';
import { AccountField, AssignToField, BranchField, DepartmentField, DescriptionField } from '../../GeneralFormFields';
import { CtaxForm } from '../../helpers/CtaxForm';
import { CustomerFields } from '../../helpers/CustomerFields';
import { RelAccountsForm } from '../../helpers/RelAccountsForm';
import { VatForm } from '../../helpers/VatForm';
import { FxaIncomeAccountFields } from './FxaIncomeAccountFields';
import { FxaIncomeDetailsTable } from './FxaIncomeDetailsTable';
import { FxaIncomeInstancesSheet } from './FxaIncomeInstancesSheet';

export const FxaIncomeForm = ({
  form,
  index,
}: {
  form: ITransactionGroupForm;
  index: number;
}) => (
  <>
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6">
      <AccountField
        form={form}
        index={index}
        filter={{ journals: [JournalEnum.FIXED_ASSET] }}
        allDetails
      />
      <CustomerFields form={form} index={index} />
      <BranchField form={form} index={index} />
      <DepartmentField form={form} index={index} />
      <AssignToField form={form} index={index} />
      <DescriptionField form={form} index={index} />
      <FxaIncomeAccountFields form={form} index={index} />
      <VatForm
        form={form}
        journalIndex={index}
        isWithTax={false}
        isSameSide
      />
      <CtaxForm
        form={form}
        journalIndex={index}
        isWithTax={false}
        isSameSide
      />
    </div>

    <div className="pt-3">
      <RelAccountsForm form={form} index={index} />
    </div>

    <FxaIncomeDetailsTable form={form} journalIndex={index} />

    <div className="flex justify-center pt-3">
      <FxaIncomeInstancesSheet form={form} journalIndex={index} />
    </div>
  </>
);
