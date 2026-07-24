import { JournalEnum } from '@/settings/account/types/Account';
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
import { RelAccountsForm } from '../../helpers/RelAccountsForm';
import { VatForm } from '../../helpers/VatForm';
import { FixedAssetForm } from './FixedAssetForm';
import { FxaIncomeInstancesSync } from './FxaIncomeInstancesSheet';
import { useFxaAccountConfig } from '../hooks/useFxaAccountConfig';

export const FxaIncomeForm = ({
  form,
  index,
}: {
  form: ITransactionGroupForm;
  index: number;
}) => {
  const onAccountChange = useFxaAccountConfig(form, index);

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6">
        <AccountField
          form={form}
          index={index}
          filter={{ journals: [JournalEnum.FIXED_ASSET] }}
          allDetails
          labelTxt="Хөрөнгийн данс"
          onAccountChange={onAccountChange}
        />
        <CustomerFields form={form} index={index} />
        <BranchField form={form} index={index} />
        <DepartmentField form={form} index={index} />
        <AssignToField form={form} index={index} />
        <DescriptionField form={form} index={index} />
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

      <FixedAssetForm form={form} journalIndex={index} />
      <FxaIncomeInstancesSync form={form} journalIndex={index} />
    </>
  );
};
