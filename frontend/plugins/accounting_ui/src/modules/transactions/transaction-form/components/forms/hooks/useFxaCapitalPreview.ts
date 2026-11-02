import { useEffect } from 'react';
import { useSetAtom } from 'jotai';
import type { ResultOf } from '@graphql-typed-document-node/core';
import { FXA_CAPITAL_VALUATION } from '@/transactions/transaction-form/graphql/queries/fxaCapitalValuation';
import { followTrDocsState } from '@/transactions/transaction-form/states/trStates';
import {
  ITransactionGroupForm,
  TTrDoc,
} from '@/transactions/transaction-form/types/JournalForms';
import { ITransaction } from '@/transactions/types/Transaction';
import { TrJournalEnum, TR_SIDES } from '@/transactions/types/constants';

export type TFxaCapitalValuation = ResultOf<
  typeof FXA_CAPITAL_VALUATION
>['fixedAssetCapitalValuation'];

export const buildFxaCapitalPreview = (
  trDoc: TTrDoc,
  valuation: TFxaCapitalValuation,
) => {
  if (trDoc.journal !== TrJournalEnum.FXA_CAPITAL) return undefined;
  const info = trDoc.details[0]?.followInfos;
  if (
    !info ||
    !valuation.count ||
    !Number.isFinite(info.originalCost) ||
    info.originalCost <= 0
  )
    return undefined;
  const costDelta = info.originalCost - valuation.originalCost;
  const depreciationDelta =
    (info.preDeprecation ?? valuation.preDeprecation) -
    valuation.preDeprecation;
  const round = (amount: number) =>
    Math.round(Math.abs(amount) * 10000) / 10000;
  const details = valuation.locations.map((location, index) => ({
    ...trDoc.details[0],
    _id:
      trDoc.details.find(
        (row) =>
          (row.branchId || '') === location.branchId &&
          (row.departmentId || '') === location.departmentId,
      )?._id ||
      (index === 0 &&
      !trDoc.details.some((row) =>
        valuation.locations.some(
          (location) =>
            (row.branchId || '') === location.branchId &&
            (row.departmentId || '') === location.departmentId,
        ),
      )
        ? trDoc.details[0]._id
        : `${trDoc._id}-location:${encodeURIComponent(
            location.branchId,
          )}:${encodeURIComponent(location.departmentId)}`),
    fixedAssetId: valuation.fixedAssetId,
    accountId: valuation.accountId,
    branchId: location.branchId,
    departmentId: location.departmentId,
    count: 0 as const,
    unitPrice: 0,
    amount: round(costDelta * location.count),
    followInfos: info,
  }));
  const follows: ITransaction[] = [];
  const append = (
    journal: TrJournalEnum,
    originType: string,
    side: string,
    accountId: string,
    delta: number,
  ) => {
    const followDetails = valuation.locations
      .map((location, index) => ({
        _id: `${trDoc._id}-${originType}-${index}`,
        fixedAssetId: valuation.fixedAssetId,
        accountId,
        branchId: location.branchId,
        departmentId: location.departmentId,
        count: 0,
        amount: round(delta * location.count),
      }))
      .filter((detail) => detail.amount > 0.005);
    if (followDetails.length)
      follows.push({
        _id: `${trDoc._id}-${originType}`,
        originId: trDoc._id,
        originType,
        journal,
        side,
        ptrId: trDoc.ptrId,
        parentId: trDoc.parentId,
        description: trDoc.description,
        details: followDetails,
        sumDt:
          side === TR_SIDES.DEBIT
            ? followDetails.reduce((sum, row) => sum + row.amount, 0)
            : 0,
        sumCt:
          side === TR_SIDES.CREDIT
            ? followDetails.reduce((sum, row) => sum + row.amount, 0)
            : 0,
      });
  };
  append(
    depreciationDelta < 0
      ? TrJournalEnum.FXA_DEP_OUT
      : TrJournalEnum.FXA_DEP_IN,
    depreciationDelta < 0 ? 'fxaCapitalDepOut' : 'fxaCapitalDepIn',
    depreciationDelta < 0 ? TR_SIDES.DEBIT : TR_SIDES.CREDIT,
    valuation.depreciationAccountId,
    depreciationDelta,
  );
  const netDelta = costDelta - depreciationDelta;
  if (trDoc.followInfos.capitalAccountId)
    append(
      TrJournalEnum.FXA_CAPITAL_BALANCE,
      netDelta < 0 ? 'fxaCapitalBalanceDt' : 'fxaCapitalBalanceCt',
      netDelta < 0 ? TR_SIDES.DEBIT : TR_SIDES.CREDIT,
      trDoc.followInfos.capitalAccountId,
      netDelta,
    );
  return {
    details,
    side: costDelta < 0 ? TR_SIDES.CREDIT : TR_SIDES.DEBIT,
    follows,
  };
};

export const useFxaCapitalPreview = ({
  form,
  index,
  trDoc,
  valuation,
}: {
  form: ITransactionGroupForm;
  index: number;
  trDoc?: TTrDoc;
  valuation?: TFxaCapitalValuation;
}): void => {
  const setFollows = useSetAtom(followTrDocsState);
  useEffect(() => {
    if (!trDoc || trDoc.journal !== TrJournalEnum.FXA_CAPITAL) return;
    const preview =
      valuation?.fixedAssetId === trDoc.details[0]?.fixedAssetId
        ? buildFxaCapitalPreview(trDoc, valuation)
        : undefined;
    if (preview) {
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
      const follows = (preview?.follows || []).map((row) => {
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
  }, [form, index, setFollows, trDoc, valuation]);
};
