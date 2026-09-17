import { useQuery } from '@apollo/client';
import { TrJournalEnum, TR_SIDES } from '@/transactions/types/constants';
import { ITransaction, ITrDetail } from '@/transactions/types/Transaction';
import { fixNum } from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { useEffect, useMemo } from 'react';
import { useWatch } from 'react-hook-form';
import { FIXED_ASSETS_QUERY } from '../../../graphql/queries/fixedAssets';
import { followTrDocsState } from '../../../states/trStates';
import { ITransactionGroupForm, TFxaDetail } from '../../../types/JournalForms';
import { fixSumDtCt, getTempId } from '../../utils';

type TFxaDisposalInstance = {
  _id: string;
  code?: string;
  name?: string;
  count?: number;
  currentCount?: number;
  originalCost?: number;
  accumulatedDepreciation?: number;
  bookValue?: number;
};

type TFxaDisposalSummary = {
  detailId?: string;
  fixedAssetId?: string;
  count: number;
  originalCost: number;
  accumulatedDepreciation: number;
  bookValue: number;
};

const buildSummary = (
  details: TFxaDetail[],
  fixedAssets: TFxaDisposalInstance[] = [],
) =>
  details
    .map((detail) => {
      const fixedAsset = fixedAssets.find(
        (item) => item._id === detail.fixedAssetId,
      );
      const count = Math.max(0, Math.trunc(detail.count || 0));
      const originalCost = fixNum((fixedAsset?.originalCost || 0) * count);
      const currentCount = fixedAsset?.currentCount ?? fixedAsset?.count ?? 0;
      const perUnitAccumulated = currentCount
        ? (fixedAsset?.accumulatedDepreciation || 0) / currentCount
        : 0;
      const accumulatedDepreciation = fixNum(perUnitAccumulated * count);
      const bookValue = fixNum(
        fixedAsset?.bookValue
          ? (fixedAsset.bookValue / (currentCount || count || 1)) * count
          : originalCost - accumulatedDepreciation,
      );

      return {
        detailId: detail._id,
        fixedAssetId: detail.fixedAssetId,
        count,
        originalCost,
        accumulatedDepreciation,
        bookValue,
      };
    })
    .filter((summary) => summary.fixedAssetId && summary.count > 0);

const buildMainDetails = (
  details: TFxaDetail[],
  summaries: TFxaDisposalSummary[],
) =>
  details.map((detail) => {
    const summary = summaries.find(
      (item) =>
        item.detailId === detail._id ||
        item.fixedAssetId === detail.fixedAssetId,
    );

    if (!summary) {
      return detail;
    }

    if (summary.count !== detail.count) {
      return detail;
    }

    return {
      ...detail,
      unitPrice: detail.count ? fixNum(summary.originalCost / detail.count) : 0,
      amount: summary.originalCost,
    };
  });

const hasMainDetailsChanged = (
  currentDetails: TFxaDetail[],
  nextDetails: TFxaDetail[],
) =>
  nextDetails.some((detail, index) => {
    const currentDetail = currentDetails[index];

    return (
      detail.count !== currentDetail?.count ||
      detail.unitPrice !== currentDetail?.unitPrice ||
      detail.amount !== currentDetail?.amount
    );
  });

const buildFollowDetails = ({
  accountId,
  amountKey,
  originType,
  summaries,
}: {
  accountId?: string;
  amountKey: 'originalCost' | 'accumulatedDepreciation' | 'bookValue';
  originType: string;
  summaries: TFxaDisposalSummary[];
}) =>
  summaries
    .filter((summary) => summary[amountKey] > 0)
    .map(
      (summary) =>
        ({
          _id: getTempId(),
          originId: summary.detailId,
          originType,
          fixedAssetId: summary.fixedAssetId,
          accountId: accountId || '',
          count: summary.count,
          unitPrice: summary.count
            ? fixNum(summary[amountKey] / summary.count)
            : 0,
          amount: summary[amountKey],
        }) as ITrDetail,
    );

const buildFollowTr = ({
  details,
  journal,
  originType,
  ptrId,
  side = TR_SIDES.DEBIT,
  trDoc,
}: {
  details: ITrDetail[];
  journal: TrJournalEnum;
  originType: string;
  ptrId: string;
  side?: string;
  trDoc: ITransaction;
}) =>
  fixSumDtCt({
    _id: getTempId(),
    originId: trDoc._id,
    originType,
    ptrId,
    parentId: trDoc.parentId,
    journal,
    side,
    branchId: trDoc.branchId,
    departmentId: trDoc.departmentId,
    customerId: trDoc.customerId,
    customerType: trDoc.customerType,
    description: trDoc.description,
    details,
  });

export const useFxaDisposalFollowTrs = ({
  createFollowTrs = true,
  form,
  journalIndex,
  updateMainDetails = true,
}: {
  createFollowTrs?: boolean;
  form: ITransactionGroupForm;
  journalIndex: number;
  updateMainDetails?: boolean;
}) => {
  const trDoc = useWatch({
    control: form.control,
    name: `trDocs.${journalIndex}`,
  }) as ITransaction;
  const setFollowTrDocs = useSetAtom(followTrDocsState);
  const fixedAssetIds = useMemo(
    () =>
      Array.from(
        new Set(
          (trDoc?.details || [])
            .map((detail) => detail.fixedAssetId)
            .filter(Boolean),
        ),
      ),
    [trDoc?.details],
  );
  const { data, loading } = useQuery<{
    fixedAssets: TFxaDisposalInstance[];
  }>(FIXED_ASSETS_QUERY, {
    variables: { ids: fixedAssetIds, limit: fixedAssetIds.length },
    skip: !fixedAssetIds.length,
  });

  useEffect(() => {
    if (!trDoc || loading || !data) {
      return;
    }

    const hasAllFixedAssets = fixedAssetIds.every((fixedAssetId) =>
      data.fixedAssets.some((fixedAsset) => fixedAsset._id === fixedAssetId),
    );
    if (!hasAllFixedAssets) {
      return;
    }

    const isPersistedTransaction = Boolean(trDoc._id && trDoc.parentId);

    // Persisted main/follow rows come from Mongo and are recalculated by the
    // backend on save. Tab mounts must never rebuild them from master caches.
    if (isPersistedTransaction) {
      return;
    }

    const summaries = buildSummary(
      (trDoc?.details || []) as TFxaDetail[],
      data.fixedAssets,
    );

    const currentDetails = (trDoc?.details || []) as TFxaDetail[];
    const nextDetails = buildMainDetails(currentDetails, summaries);

    if (
      updateMainDetails &&
      hasMainDetailsChanged(currentDetails, nextDetails)
    ) {
      form.setValue(`trDocs.${journalIndex}.details`, nextDetails);
    }

    if (!createFollowTrs) {
      return;
    }

    setFollowTrDocs((prev) => {
      const existing = prev || [];
      const remaining = existing.filter(
        (followTr) =>
          !(
            followTr.originId === trDoc._id &&
            ['fxaSaleOut', 'fxaDepOut', 'fxaSaleCost'].includes(
              followTr.originType || '',
            )
          ),
      );

      const costDetails =
        trDoc.journal === TrJournalEnum.FXA_SALE
          ? buildFollowDetails({
              accountId: trDoc.followInfos?.saleOutAccountId,
              amountKey: 'originalCost',
              originType: 'fxaSaleOut',
              summaries,
            })
          : [];
      const depreciationDetails = buildFollowDetails({
        accountId: trDoc.followInfos?.accumulatedDepreciationAccountId,
        amountKey: 'accumulatedDepreciation',
        originType: 'fxaDepOut',
        summaries,
      });
      const lossDetails =
        trDoc.journal === TrJournalEnum.FXA_SALE
          ? buildFollowDetails({
              accountId: trDoc.followInfos?.saleCostAccountId,
              amountKey: 'bookValue',
              originType: 'fxaSaleCost',
              summaries,
            })
          : [];
      const ptrId = trDoc.ptrId || getTempId();

      return [
        ...remaining,
        ...(costDetails.length
          ? [
              buildFollowTr({
                details: costDetails,
                journal: TrJournalEnum.FXA_SALE_OUT,
                originType: 'fxaSaleOut',
                ptrId,
                side: TR_SIDES.CREDIT,
                trDoc,
              }),
            ]
          : []),
        ...(depreciationDetails.length
          ? [
              buildFollowTr({
                details: depreciationDetails,
                journal: TrJournalEnum.FXA_DEP_OUT,
                originType: 'fxaDepOut',
                ptrId,
                trDoc,
              }),
            ]
          : []),
        ...(lossDetails.length
          ? [
              buildFollowTr({
                details: lossDetails,
                journal: TrJournalEnum.FXA_SALE_COST,
                originType: 'fxaSaleCost',
                ptrId,
                trDoc,
              }),
            ]
          : []),
      ];
    });
  }, [
    createFollowTrs,
    data,
    fixedAssetIds,
    form,
    journalIndex,
    loading,
    JSON.stringify(trDoc?.details || []),
    setFollowTrDocs,
    trDoc,
    updateMainDetails,
  ]);
};
