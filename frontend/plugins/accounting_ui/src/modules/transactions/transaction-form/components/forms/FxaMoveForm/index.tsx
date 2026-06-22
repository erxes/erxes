import { JournalEnum } from '@/settings/account/types/Account';
import { ITransactionGroupForm } from '../../../types/JournalForms';
import { AccountField, AssignToField, BranchField, DepartmentField, DescriptionField } from '../../GeneralFormFields';
import { CustomerFields } from '../../helpers/CustomerFields';
import { RelAccountsForm } from '../../helpers/RelAccountsForm';
import { FxaMoveAccountFields } from './FxaMoveAccountFields';
import { FxaMoveDetailsTable } from './FxaMoveDetailsTable';

export const FxaMoveForm = ({
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
      <FxaMoveAccountFields form={form} index={index} />
    </div>

    <div className="pt-3">
      <RelAccountsForm form={form} index={index} />
    </div>

    <FxaMoveDetailsTable form={form} journalIndex={index} />
  </>
);
