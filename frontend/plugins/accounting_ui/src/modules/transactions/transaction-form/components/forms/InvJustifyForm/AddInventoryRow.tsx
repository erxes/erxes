import { IconPlus } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useWatch } from 'react-hook-form';
import { SelectProductsBulk } from 'ui-modules';
import {
  ITransactionGroupForm,
  TInvDetail,
  TInvJustifyJournal,
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
  const trDoc = useWatch({
    control: form.control,
    name: `trDocs.${journalIndex}`,
  }) as TInvJustifyJournal;
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
        onSelect={(productIds) =>
          append(
            productIds.map((productId) => getDetailDefaultValues(productId)),
          )
        }
      >
        <Button variant="secondary" className="bg-border">
          <IconPlus />
          Олон бараа нэмэх
        </Button>
      </SelectProductsBulk>
    </>
  );
};
