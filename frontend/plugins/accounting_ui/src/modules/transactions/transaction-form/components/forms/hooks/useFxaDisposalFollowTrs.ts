import { useQuery } from '@apollo/client';
import { TrJournalEnum, TR_SIDES } from '@/transactions/types/constants';
import { ITransaction, ITrDetail } from '@/transactions/types/Transaction';
import { fixNum } from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { useEffect } from 'react';
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
  const fixedAssetIds = Array.from(
    new Set(
      (trDoc?.details || [])
        .map((detail) => detail.fixedAssetId)
        .filter(Boolean),
    ),
  );
  const { data } = useQuery<{ fixedAssets: TFxaDisposalInstance[] }>(
    FIXED_ASSETS_QUERY,
    {
      variables: { ids: fixedAssetIds, limit: fixedAssetIds.length },
      skip: !fixedAssetIds.length,
    },
  );

  useEffect(() => {
    if (!trDoc) {
      return;
    }

    const summaries = buildSummary(
      (trDoc?.details || []) as TFxaDetail[],
      data?.fixedAssets || [],
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
            ['fxaOutCost', 'fxaOutDepreciation', 'fxaOutLoss'].includes(
              followTr.originType || '',
            )
          ),
      );

      const costDetails =
        trDoc.journal === TrJournalEnum.FXA_SALE
          ? buildFollowDetails({
              accountId: trDoc.followInfos?.fixedAssetAccountId,
              amountKey: 'originalCost',
              originType: 'fxaOutCost',
              summaries,
            })
          : [];
      const depreciationDetails = buildFollowDetails({
        accountId: trDoc.followInfos?.accumulatedDepreciationAccountId,
        amountKey: 'accumulatedDepreciation',
        originType: 'fxaOutDepreciation',
        summaries,
      });
      const lossDetails = buildFollowDetails({
        accountId: trDoc.followInfos?.lossAccountId,
        amountKey: 'bookValue',
        originType: 'fxaOutLoss',
        summaries,
      });
      const ptrId = trDoc.ptrId || getTempId();

      return [
        ...remaining,
        ...(costDetails.length
          ? [
              buildFollowTr({
                details: costDetails,
                journal: TrJournalEnum.FXA_OUT_COST,
                originType: 'fxaOutCost',
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
                journal: TrJournalEnum.FXA_OUT_DEPRECIATION,
                originType: 'fxaOutDepreciation',
                ptrId,
                trDoc,
              }),
            ]
          : []),
        ...(lossDetails.length
          ? [
              buildFollowTr({
                details: lossDetails,
                journal: TrJournalEnum.FXA_OUT_LOSS,
                originType: 'fxaOutLoss',
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
    form,
    journalIndex,
    JSON.stringify(trDoc?.details || []),
    setFollowTrDocs,
    trDoc,
    updateMainDetails,
  ]);
};
