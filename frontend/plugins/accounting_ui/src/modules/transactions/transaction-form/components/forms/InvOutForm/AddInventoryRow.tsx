import { useApolloClient } from '@apollo/client';
import { IconPlus } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useWatch } from 'react-hook-form';
import { SelectProductsBulk } from 'ui-modules';
import { GET_ACC_CURRENT_COST_QUERY } from '../../../graphql/queries/invCostInfo';
import type { IInvCostInfo } from '../../../hooks/useGetInvCostInfo';
import {
  ITransactionGroupForm,
  TInvDetail,
  TInvOutJournal,
} from '../../../types/JournalForms';
import { getTempId } from '../../utils';

export const AddDetailRowButton = ({
  append,
  journalIndex,
  form,
}: {
  form: ITransactionGroupForm;
  journalIndex: number;
  append: (detail: TInvDetail | TInvDetail[]) => void;
}) => {
  const client = useApolloClient();
  const { control } = form;

  const trDoc = useWatch({
    control,
    name: `trDocs.${journalIndex}`,
  }) as TInvOutJournal;

  const lastDetail = trDoc.details[trDoc.details.length - 1];

  const getDetailDefaultValues = (productId = '') => ({
    ...lastDetail,
    _id: getTempId(),
    amount: 0,
    productId,
    count: 0,
    unitPrice: 0,
  });

  return (
    <>
      <Button
        variant="secondary"
        className="bg-border"
        onClick={() => append(getDetailDefaultValues())}
      >
        <IconPlus />
        Шинэ мөр
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
                excludedTransactionIds: trDoc._id ? [trDoc._id] : undefined,
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
          Олон бараа нэмэх
        </Button>
      </SelectProductsBulk>
    </>
  );
};
