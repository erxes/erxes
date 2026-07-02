import { IAccount } from '@/settings/account/types/Account';
import { useFixedAssetAccountConfigs } from '@/settings/fixed-assets/account-config/hooks/useFixedAssetAccountConfigs';
import { ITransactionGroupForm } from '../../../types/JournalForms';

export const useFxaAccountConfig = (
  form: ITransactionGroupForm,
  index: number,
) => {
  const { configs } = useFixedAssetAccountConfigs();

  return (account: IAccount) => {
    const value = configs?.find(
      (config) => config.accountId === account._id,
    )?.value;

    form.setValue(
      `trDocs.${index}.followInfos.fixedAssetAccountId`,
      account._id,
    );
    form.setValue(`trDocs.${index}.followExtras.fixedAssetAccount`, account);

    if (!value) {
      return;
    }

    form.setValue(
      `trDocs.${index}.followInfos.accumulatedDepreciationAccountId`,
      value.depreciationAccountId,
    );
    form.setValue(
      `trDocs.${index}.followInfos.deferredTaxAssetAccountId`,
      value.taxAssetAccountId,
    );
    form.setValue(
      `trDocs.${index}.followInfos.deferredTaxLiabilityAccountId`,
      value.taxLiabilityAccountId,
    );
    form.setValue(
      `trDocs.${index}.followInfos.incomeTaxExpenseAccountId`,
      value.TaxExpenseAccountId,
    );
  };
};
