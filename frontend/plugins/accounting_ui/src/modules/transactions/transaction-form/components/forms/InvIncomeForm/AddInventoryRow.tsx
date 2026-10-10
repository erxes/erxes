import { toIncomePriceMap } from '../../../hooks/useGetInvCostInfo';
import { useApolloClient } from '@apollo/client';
import { IconPlus } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useWatch } from 'react-hook-form';
import { SelectProductsBulk } from 'ui-modules';
import { GET_ACC_BULK_INCOME_PRODUCT_FILL_QUERY } from '../../../graphql/queries/invCostInfo';

import { ITransactionGroupForm, TInvDetail } from '../../../types/JournalForms';
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

  const preDetails = useWatch({
    control,
    name: `trDocs.${journalIndex}.details`,
  });

  const lastDetail = preDetails[preDetails.length - 1];

  const getDetailDefaultValues = (productId = '') => ({
    ...lastDetail,
    _id: getTempId(),
    amount: 0,
    productId,
    count: 1,
    unitPrice: 0,
    weight: undefined,
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
        Шинэ мөр
      </Button>
      <SelectProductsBulk
        productIds={[]}
        onSelect={async (productIds) => {
          const { data } = await client.query({
            query: GET_ACC_BULK_INCOME_PRODUCT_FILL_QUERY,
            variables: { productIds, limit: productIds.length },
            fetchPolicy: 'network-only',
          });

          const details = productIds.map((productId) => {
            const product = data.productsMain?.list?.find(
              (product) => product?._id === productId,
            );
            const detail = getDetailDefaultValues(productId);
            const unitPrice =
              toIncomePriceMap(data.getAccLastIncomePrice)[productId] ?? 0;

            return {
              ...detail,
              unitPrice,
              amount: (detail.count ?? 0) * unitPrice,
              weight: (detail.count ?? 0) * (product?.weight ?? 1),
            };
          });

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
