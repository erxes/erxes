import { useEffect, useMemo } from 'react';
import { useWatch } from 'react-hook-form';
import { useSetAtom } from 'jotai';
import { useFixedAssetAccountConfigs } from '@/settings/fixed-assets/account-config/hooks/useFixedAssetAccountConfigs';
import type {
  ITransactionGroupForm,
  TFxaIncomeJournal,
} from '@/transactions/transaction-form/types/JournalForms';
import { followTrDocsState } from '@/transactions/transaction-form/states/trStates';
import {
  buildFxaIncomeTaxPreview,
  mergeFxaIncomeTaxFollows,
} from '@/transactions/transaction-form/components/forms/hooks/fxaIncomeTaxPreview';

export const useFxaIncomeTaxPreview = (
  form: ITransactionGroupForm,
  index: number,
): { error?: string } => {
  const transaction = useWatch({
    control: form.control,
    name: `trDocs.${index}`,
  }) as TFxaIncomeJournal;
  const { configs, loading, error } = useFixedAssetAccountConfigs();
  const setFollows = useSetAtom(followTrDocsState);
  const hasTax = transaction?.details.some(
    (detail) => detail.followInfos?.hasTaxDepreciation,
  );
  const preview = useMemo(() => {
    if (!transaction || (hasTax && (loading || error))) return undefined;
    return buildFxaIncomeTaxPreview(
      transaction,
      Object.fromEntries(
        configs.map((config) => [config.accountId, config.value]),
      ),
    );
  }, [transaction, hasTax, configs, loading, error]);
  useEffect(() => {
    if (!preview || !transaction) return;
    setFollows((previous) =>
      mergeFxaIncomeTaxFollows(previous, preview.follows, transaction._id),
    );
  }, [preview, transaction, setFollows]);
  return { error: hasTax && error ? error.message : preview?.error };
};
