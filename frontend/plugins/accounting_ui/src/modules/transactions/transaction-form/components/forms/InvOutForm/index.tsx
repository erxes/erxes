import { JournalEnum } from '@/settings/account/types/Account';
import { ITransactionGroupForm } from '../../../types/JournalForms';
import {
  AccountField,
  AssignToField,
  BranchField,
  DepartmentField,
  DescriptionField,
  SideField,
} from '../../GeneralFormFields';
import { TR_SIDES } from '../../../../types/constants';
import { CustomerFields } from '../../helpers/CustomerFields';
import { RelAccountsForm } from '../../helpers/RelAccountsForm';
import { InventoryForm } from './InventoryForm';

export const InvOutForm = ({
  form,
  index,
  isJustify,
}: {
  form: ITransactionGroupForm;
  index: number;
  isJustify?: boolean;
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
        {isJustify && (
          <SideField
            form={form}
            index={index}
            sides={TR_SIDES.JUSTIFY_OPTIONS}
            labelTxt="Өртгийн өөрчлөлт"
          />
        )}
        <CustomerFields form={form} index={index} />
        <BranchField form={form} index={index} />
        <DepartmentField form={form} index={index} />
        <AssignToField form={form} index={index} />
        <DescriptionField form={form} index={index} />
      </div>

      <div className="pt-3">
        <RelAccountsForm form={form} index={index} />
      </div>

      <InventoryForm form={form} journalIndex={index} isJustify={isJustify} />
    </>
  );
};
