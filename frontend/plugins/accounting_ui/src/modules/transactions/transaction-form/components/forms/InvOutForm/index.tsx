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
import { JournalEnum } from '@/settings/account/types/Account';

export const InvOutForm = ({
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
      </div>

      <InventoryForm
        form={form}
        journalIndex={index}
      />
    </>
  );
};
