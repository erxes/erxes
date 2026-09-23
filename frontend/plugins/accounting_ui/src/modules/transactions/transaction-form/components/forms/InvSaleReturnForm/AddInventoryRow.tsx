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
  TInvSaleReturnJournal,
} from '../../../types/JournalForms';
import { getTempId } from '../../utils';

export const AddDetailRowButton = ({
  append,
  journalIndex,
  form,
  setPrefilledUnitCosts,
}: {
  form: ITransactionGroupForm;
  journalIndex: number;
  append: (detail: TInvDetail | TInvDetail[]) => void;
  setPrefilledUnitCosts: (unitCosts: Record<string, number>) => void;
}) => {
  const client = useApolloClient();
  const { control } = form;

  const trDoc = useWatch({
    control,
    name: `trDocs.${journalIndex}`,
  }) as TInvSaleReturnJournal;

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

          if (trDoc.followInfos?.saleOutAccountId) {
            const { data } = await client.query<{
              getAccCurrentCost: IInvCostInfo;
            }>({
              query: GET_ACC_CURRENT_COST_QUERY,
              variables: {
                productIds,
                accountId: trDoc.followInfos.saleOutAccountId,
                branchId: trDoc.branchId,
                departmentId: trDoc.departmentId,
              },
              fetchPolicy: 'network-only',
            });
            currentCostInfo = data.getAccCurrentCost;
          }

          const details = productIds.map((productId) =>
            getDetailDefaultValues(productId),
          );

          setPrefilledUnitCosts(
            Object.fromEntries(
              details.map(({ _id, productId }) => [
                _id,
                currentCostInfo[productId]?.unitCost ?? 0,
              ]),
            ),
          );
          append(details);
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
