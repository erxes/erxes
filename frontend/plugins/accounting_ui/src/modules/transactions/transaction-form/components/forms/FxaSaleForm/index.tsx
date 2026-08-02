import { ITransactionGroupForm } from '../../../types/JournalForms';
import {
  AccountField,
  AssignToField,
  BranchField,
  DepartmentField,
  DescriptionField,
} from '../../GeneralFormFields';
import { CustomerFields } from '../../helpers/CustomerFields';
import { CtaxForm } from '../../helpers/CtaxForm';
import { VatForm } from '../../helpers/VatForm';
import { RelAccountsForm } from '../../helpers/RelAccountsForm';
import { FixedAssetForm } from './FixedAssetForm';
import { FxaSaleAccountFields } from './FxaSaleAccountFields';
import { useFxaAccountConfig } from '../hooks/useFxaAccountConfig';
import { useFxaDisposalFollowTrs } from '../hooks/useFxaDisposalFollowTrs';
import { JournalEnum } from '~/modules/settings/account/types/Account';

export const FxaSaleForm = ({
  form,
  index,
}: {
  form: ITransactionGroupForm;
  index: number;
}) => {
  const onFixedAssetAccountChange = useFxaAccountConfig(form, index);
  useFxaDisposalFollowTrs({
    form,
    journalIndex: index,
    updateMainDetails: false,
  });

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6">
        <AccountField
          form={form}
          index={index}
          allDetails
          labelTxt="Борлуулалтын орлогын данс"
          filter={{
            journals: [JournalEnum.FXA_FOLLOW],
          }}
        />
        <CustomerFields form={form} index={index} />
        <BranchField form={form} index={index} />
        <DepartmentField form={form} index={index} />
        <AssignToField form={form} index={index} />
        <DescriptionField form={form} index={index} />
        <FxaSaleAccountFields
          form={form}
          index={index}
          onFixedAssetAccountChange={onFixedAssetAccountChange}
          showFixedAssetAccount
          showGainAccount={false}
        />
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
    </>
  );
};
