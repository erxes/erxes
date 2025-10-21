import { TR_SIDES } from '@/transactions/types/constants';
import { IconPlus } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useWatch } from 'react-hook-form';
import { ITransactionGroupForm, TInvDetail } from '../../../types/JournalForms';
import { getTempId } from '../../utils';
import { SelectProductsBulk } from 'ui-modules';

export const AddDetailRowButton = ({
  append,
  journalIndex,
  form,
}: {
  form: ITransactionGroupForm;
  journalIndex: number;
  append: (detail: TInvDetail | TInvDetail[]) => void;
}) => {
  const { control } = form;
  const productIds = useWatch({
    control,
    name: `trDocs.${journalIndex}.details`,
  })
    .map((detail) => detail.productId || '')
    .filter((productId) => !!productId);

  const preDetails = useWatch({
    control,
    name: `trDocs.${journalIndex}.details`,
  });

  const lastDetail = preDetails[preDetails.length - 1];

  const detailDefaultValues = {
    ...lastDetail,
    _id: getTempId(),
    side: TR_SIDES.CREDIT,
    amount: 0,
    productId: '',
    count: 0,
    unitPrice: 0,
  };

  return (
    <>
      <Button
        variant="secondary"
        className="bg-border"
        onClick={() => append(detailDefaultValues)}
      >
        <IconPlus />
        Add Empty Row
      </Button>
      <SelectProductsBulk
        productIds={productIds}
        onSelect={(productIds) => {
          append(
            productIds.map((productId) => ({
              ...detailDefaultValues,
              productId,
            })),
          );
        }}
      >
        <Button variant="secondary" className="bg-border">
          <IconPlus />
          Add Many Productsdd
        </Button>
      </SelectProductsBulk>
    </>
  );
};
