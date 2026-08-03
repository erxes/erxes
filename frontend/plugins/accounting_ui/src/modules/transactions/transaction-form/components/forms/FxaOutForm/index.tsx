import { JournalEnum } from '@/settings/account/types/Account';
import { ITransactionGroupForm } from '../../../types/JournalForms';
import {
  AccountField,
  AssignToField,
  BranchField,
  DepartmentField,
  DescriptionField,
} from '../../GeneralFormFields';
import { CustomerFields } from '../../helpers/CustomerFields';
import { RelAccountsForm } from '../../helpers/RelAccountsForm';
import { FixedAssetForm } from './FixedAssetForm';
import { useFxaAccountConfig } from '../hooks/useFxaAccountConfig';
import { useFxaDisposalFollowTrs } from '../hooks/useFxaDisposalFollowTrs';
import { FxaSaleAccountFields } from '../FxaSaleForm/FxaSaleAccountFields';

export const FxaOutForm = ({
  form,
  index,
}: {
  form: ITransactionGroupForm;
  index: number;
}) => {
  const onAccountChange = useFxaAccountConfig(form, index);
  useFxaDisposalFollowTrs({ form, journalIndex: index });

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
        <FxaSaleAccountFields
          form={form}
          index={index}
          showGainAccount={false}
        />
      </div>

      <div className="pt-3">
        <RelAccountsForm form={form} index={index} />
      </div>

      <FixedAssetForm form={form} journalIndex={index} />
    </>
  );
};
