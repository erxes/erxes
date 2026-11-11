import { useEffect, useMemo } from 'react';
import { useSetAtom } from 'jotai';
import { followTrDocsState } from '@/transactions/transaction-form/states/trStates';
import {
  ITransactionGroupForm,
  TTrDoc,
} from '@/transactions/transaction-form/types/JournalForms';
import { TrJournalEnum } from '@/transactions/types/constants';
import {
  buildFxaCapitalPreview,
  mergeFxaDepreciationFollows,
  TFxaCapitalValuation,
} from '@/transactions/transaction-form/components/forms/hooks/fxaCapitalPreview';

export const useFxaCapitalPreview = ({
  form,
  index,
  trDoc,
  valuation,
}: {
  form: ITransactionGroupForm;
  index: number;
  trDoc?: TTrDoc;
  valuation?: TFxaCapitalValuation | TFxaCapitalValuation[];
}): boolean => {
  const setFollows = useSetAtom(followTrDocsState);
  const preview = useMemo(
    () =>
      trDoc && valuation ? buildFxaCapitalPreview(trDoc, valuation) : undefined,
    [trDoc, valuation],
  );
  useEffect(() => {
    if (
      !trDoc ||
      (trDoc.journal !== TrJournalEnum.FXA_CAPITAL &&
        trDoc.journal !== TrJournalEnum.FXA_REVALUATION)
    )
      return;
    if (preview && !preview.mixedDirections) {
      if (JSON.stringify(trDoc.details) !== JSON.stringify(preview.details)) {
        form.setValue(`trDocs.${index}.details`, preview.details);
      }
      if (trDoc.side !== preview.side)
        form.setValue(`trDocs.${index}.side`, preview.side);
    }
    setFollows((previous) =>
      mergeFxaDepreciationFollows(
        previous,
        preview?.mixedDirections ? [] : preview?.follows || [],
        trDoc._id,
      ),
    );
  }, [form, index, preview, setFollows, trDoc]);
  return preview?.mixedDirections || false;
};
