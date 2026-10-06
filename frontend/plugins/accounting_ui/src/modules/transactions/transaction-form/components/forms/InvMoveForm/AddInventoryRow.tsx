import { useTranslation } from 'react-i18next';
import { useApolloClient } from '@apollo/client';
import { IconPlus } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useWatch } from 'react-hook-form';
import { SelectProductsBulk } from 'ui-modules';
import { GET_ACC_CURRENT_COST_QUERY } from '../../../graphql/queries/invCostInfo';
import type { IInvCostInfo } from '../../../hooks/useGetInvCostInfo';
import { followTrDocsState } from '../../../states/trStates';
import {
  ITransactionGroupForm,
  TInvDetail,
  TInvMoveJournal,
} from '../../../types/JournalForms';
import { getTempId } from '../../utils';
import { TrJournalEnum } from '~/modules/transactions/types/constants';
import { useAtomValue } from 'jotai';

export const AddDetailRowButton = ({
  append,
  journalIndex,
  form,
}: {
  form: ITransactionGroupForm;
  journalIndex: number;
  append: (detail: TInvDetail | TInvDetail[]) => void;
}) => {
  const { t } = useTranslation('accounting');

  const client = useApolloClient();
  const { control } = form;

  const trDoc = useWatch({
    control,
    name: `trDocs.${journalIndex}`,
  }) as TInvMoveJournal;
  const followTrDocs = useAtomValue(followTrDocsState);
  const moveInTransaction = followTrDocs.find(
    (transaction) =>
      transaction.originId === trDoc._id &&
      transaction.originType === TrJournalEnum.INV_MOVE_IN,
  );
  const excludedTransactionIds = [trDoc._id, moveInTransaction?._id].filter(
    (transactionId): transactionId is string => Boolean(transactionId),
  );

  const lastDetail = trDoc.details[trDoc.details.length - 1];

  const getDetailDefaultValues = (productId = '') => ({
    ...lastDetail,
    _id: getTempId(),
    amount: 0,
    productId,
    count: 1,
    unitPrice: 0,
    followInfos: lastDetail?.followInfos
      ? { ...lastDetail.followInfos, invSplit: undefined }
      : undefined,
  });

  return (
    <>
      <Button
        variant="secondary"
        className="bg-border"
        onClick={() => append(getDetailDefaultValues())}
      >
        <IconPlus />
        {t('add-row')}
      </Button>
      <SelectProductsBulk
        productIds={[]}
        onSelect={async (productIds) => {
          let currentCostInfo: IInvCostInfo = {};

          if (lastDetail?.accountId) {
            const { data } = await client.query<{
              getAccCurrentCost: IInvCostInfo;
            }>({
              query: GET_ACC_CURRENT_COST_QUERY,
              variables: {
                productIds,
                accountId: lastDetail.accountId,
                branchId: lastDetail.branchId || trDoc.branchId,
                departmentId: lastDetail.departmentId || trDoc.departmentId,
                excludedTransactionIds,
              },
              fetchPolicy: 'network-only',
            });
            currentCostInfo = data.getAccCurrentCost;
          }

          append(
            productIds.map((productId) => {
              const detail = getDetailDefaultValues(productId);
              const unitPrice = currentCostInfo[productId]?.unitCost ?? 0;

              return {
                ...detail,
                unitPrice,
                amount: (detail.count ?? 0) * unitPrice,
              };
            }),
          );
        }}
      >
        <Button variant="secondary" className="bg-border">
          <IconPlus />
          {t('add-multiple-products')}
        </Button>
      </SelectProductsBulk>
    </>
  );
};
