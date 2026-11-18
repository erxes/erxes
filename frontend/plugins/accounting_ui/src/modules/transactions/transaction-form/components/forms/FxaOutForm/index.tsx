import { JournalEnum } from '@/settings/account/types/Account';
import { ITransactionGroupForm } from '../../../types/JournalForms';
import {
  AccountField,
  AssignToField,
  DescriptionField,
} from '../../GeneralFormFields';
import { CustomerFields } from '../../helpers/CustomerFields';
import { RelAccountsForm } from '../../helpers/RelAccountsForm';
import { FixedAssetForm } from './FixedAssetForm';
import { useFxaDisposalFollowTrs } from '../hooks/useFxaDisposalFollowTrs';
import { FxaOutAccountWarning } from '@/transactions/transaction-form/components/forms/FxaOutForm/FxaOutAccountWarning';

export const FxaOutForm = ({
  form,
  index,
}: {
  form: ITransactionGroupForm;
  index: number;
}) => {
  useFxaDisposalFollowTrs({ form, journalIndex: index });

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6">
        <AccountField
          form={form}
          index={index}
          filter={{ journals: [JournalEnum.FIXED_ASSET] }}
          allDetails
          labelTxt="asset-account"
        />
        <CustomerFields form={form} index={index} />
        <AssignToField form={form} index={index} />
        <DescriptionField form={form} index={index} />
      </div>

      <FxaOutAccountWarning form={form} index={index} />

      <div className="pt-3">
        <RelAccountsForm form={form} index={index} />
      </div>

      <FixedAssetForm form={form} journalIndex={index} />
    </>
  );
};
