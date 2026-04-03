import { TR_SIDES } from '@/transactions/types/constants';
import { IconPlus } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useWatch } from 'react-hook-form';
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
      <Button
        variant="secondary"
        className="bg-border"
        onClick={() =>
          append([
            detailDefaultValues,
            detailDefaultValues,
            detailDefaultValues,
          ])
        }
      >
        <IconPlus />
        Add Many Products
      </Button>
    </>
  );
};
