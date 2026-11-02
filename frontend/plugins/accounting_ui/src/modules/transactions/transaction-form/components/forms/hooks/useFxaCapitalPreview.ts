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
    if (!trDoc || trDoc.journal !== TrJournalEnum.FXA_CAPITAL) return;
    if (preview && !preview.mixedDirections) {
      if (JSON.stringify(trDoc.details) !== JSON.stringify(preview.details)) {
        form.setValue(`trDocs.${index}.details`, preview.details);
      }
      if (trDoc.side !== preview.side)
        form.setValue(`trDocs.${index}.side`, preview.side);
    }
    setFollows((previous) => {
      const remaining = previous.filter(
        (row) =>
          !(
            row.originId === trDoc._id &&
            row.originType?.startsWith('fxaCapital')
          ),
      );
      const follows = (
        preview?.mixedDirections ? [] : preview?.follows || []
      ).map((row) => {
        const saved = previous.find(
          (old) =>
            old.originId === trDoc._id && old.originType === row.originType,
        );
        return {
          ...saved,
          ...row,
          _id: saved?._id || row._id,
          details: row.details.map((detail) => {
            const savedDetail = saved?.details.find(
              (old) =>
                old.fixedAssetId === detail.fixedAssetId &&
                (old.branchId || '') === (detail.branchId || '') &&
                (old.departmentId || '') === (detail.departmentId || ''),
            );
            return {
              ...savedDetail,
              ...detail,
              _id: savedDetail?._id || detail._id,
            };
          }),
        };
      });
      const next = [...remaining, ...follows];
      return JSON.stringify(previous) === JSON.stringify(next)
        ? previous
        : next;
    });
  }, [form, index, preview, setFollows, trDoc]);
  return preview?.mixedDirections || false;
};
