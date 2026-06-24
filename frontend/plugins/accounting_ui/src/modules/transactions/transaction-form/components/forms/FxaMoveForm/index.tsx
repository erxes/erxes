import { JournalEnum } from '@/settings/account/types/Account';
import { ITransactionGroupForm } from '../../../types/JournalForms';
import { AccountField, AssignToField, BranchField, DepartmentField, DescriptionField } from '../../GeneralFormFields';
import { CustomerFields } from '../../helpers/CustomerFields';
import { RelAccountsForm } from '../../helpers/RelAccountsForm';
import { FxaMoveAccountFields } from './FxaMoveAccountFields';
import { FxaMoveDetailsTable } from './FxaMoveDetailsTable';
import { useFxaAccountConfig } from '../hooks/useFxaAccountConfig';
import { FxaInstanceSelectionSheet } from '../FxaInstanceSelectionSheet';

export const FxaMoveForm = ({
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
      <FxaMoveAccountFields form={form} index={index} />
    </div>

    <div className="pt-3">
      <RelAccountsForm form={form} index={index} />
    </div>

    <FxaMoveDetailsTable form={form} journalIndex={index} />
    <div className="flex justify-center pt-3">
      <FxaInstanceSelectionSheet form={form} journalIndex={index} />
    </div>
  </>
  );
};
