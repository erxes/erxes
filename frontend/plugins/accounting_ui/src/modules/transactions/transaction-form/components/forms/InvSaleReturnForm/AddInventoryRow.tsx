import { IconPlus } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useWatch } from 'react-hook-form';
import { SelectProductsBulk } from 'ui-modules';
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
  const { control } = form;

  const preDetails = useWatch({
    control,
    name: `trDocs.${journalIndex}.details`,
  });

  const lastDetail = preDetails[preDetails.length - 1];

  const detailDefaultValues = {
    ...lastDetail,
    _id: getTempId(),
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
        Хоосон мөр нэмэх
      </Button>
      <SelectProductsBulk
        productIds={
          preDetails
            .map((det) => det.productId ?? '')
            .filter((prodId) => !!prodId) || []
        }
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
          Олон бараа нэмэх
        </Button>
      </SelectProductsBulk>
    </>
  );
};
