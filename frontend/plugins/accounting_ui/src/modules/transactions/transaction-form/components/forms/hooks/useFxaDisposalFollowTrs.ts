import { useQuery } from '@apollo/client';
import { TrJournalEnum, TR_SIDES } from '@/transactions/types/constants';
import { ITransaction, ITrDetail } from '@/transactions/types/Transaction';
import { fixNum } from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { useEffect } from 'react';
import { useWatch } from 'react-hook-form';
import { FXA_INSTANCES_QUERY } from '../../../graphql/queries/fixedAssets';
import { followTrDocsState } from '../../../states/trStates';
import { ITransactionGroupForm, TFxaDetail } from '../../../types/JournalForms';
import { fixSumDtCt, getTempId } from '../../utils';

type TFxaDisposalInstance = {
  _id: string;
  fixedAssetId: string;
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

const getDetailInstances = (
  detail: TFxaDetail,
  instances: TFxaDisposalInstance[],
) =>
  instances.filter((instance) => instance.fixedAssetId === detail.fixedAssetId);

const buildSummary = (
  details: TFxaDetail[] = [],
  instances: TFxaDisposalInstance[] = [],
) =>
  details
    .map((detail) => {
      const detailInstances = getDetailInstances(detail, instances);

      return {
        detailId: detail._id,
        fixedAssetId: detail.fixedAssetId,
        count: detailInstances.length,
        originalCost: fixNum(
          detailInstances.reduce(
            (sum, instance) => sum + (instance.originalCost || 0),
            0,
          ),
        ),
        accumulatedDepreciation: fixNum(
          detailInstances.reduce(
            (sum, instance) => sum + (instance.accumulatedDepreciation || 0),
            0,
          ),
        ),
        bookValue: fixNum(
          detailInstances.reduce(
            (sum, instance) =>
              sum +
              (instance.bookValue ??
                (instance.originalCost || 0) -
                  (instance.accumulatedDepreciation || 0)),
            0,
          ),
        ),
      };
    })
    .filter((summary) => summary.fixedAssetId && summary.count > 0);

const buildMainDetails = (
  details: TFxaDetail[] = [],
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

    return {
      ...detail,
      count: summary.count,
      unitPrice: summary.count
        ? fixNum(summary.originalCost / summary.count)
        : 0,
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
  amountKey: 'accumulatedDepreciation' | 'bookValue';
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
  trDoc,
}: {
  details: ITrDetail[];
  journal: TrJournalEnum;
  originType: string;
  ptrId: string;
  trDoc: ITransaction;
}) =>
  fixSumDtCt({
    _id: getTempId(),
    originId: trDoc._id,
    originType,
    ptrId,
    parentId: trDoc.parentId,
    journal,
    side: TR_SIDES.DEBIT,
    branchId: trDoc.branchId,
    departmentId: trDoc.departmentId,
    customerId: trDoc.customerId,
    customerType: trDoc.customerType,
    description: trDoc.description,
    details,
  });

export const useFxaDisposalFollowTrs = ({
  form,
  journalIndex,
}: {
  form: ITransactionGroupForm;
  journalIndex: number;
}) => {
  const trDoc = useWatch({
    control: form.control,
    name: `trDocs.${journalIndex}`,
  }) as ITransaction;
  const setFollowTrDocs = useSetAtom(followTrDocsState);
  const selectedIds = trDoc?.extraData?.fxaInstanceIds || [];
  const { data } = useQuery<{ fxaInstances: TFxaDisposalInstance[] }>(
    FXA_INSTANCES_QUERY,
    {
      variables: { ids: selectedIds },
      skip: !selectedIds.length,
    },
  );

  useEffect(() => {
    if (!trDoc) {
      return;
    }

    const summaries = buildSummary(
      (trDoc?.details || []) as TFxaDetail[],
      data?.fxaInstances || [],
    );

    const currentDetails = (trDoc?.details || []) as TFxaDetail[];
    const nextDetails = buildMainDetails(currentDetails, summaries);

    if (hasMainDetailsChanged(currentDetails, nextDetails)) {
      form.setValue(`trDocs.${journalIndex}.details`, nextDetails);
    }

    setFollowTrDocs((prev) => {
      const existing = prev || [];
      const remaining = existing.filter(
        (followTr) =>
          !(
            followTr.originId === trDoc._id &&
            ['fxaOutDepreciation', 'fxaOutLoss'].includes(
              followTr.originType || '',
            )
          ),
      );

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
    data,
    form,
    journalIndex,
    JSON.stringify(trDoc?.details || []),
    JSON.stringify(selectedIds),
    setFollowTrDocs,
    trDoc,
  ]);
};
