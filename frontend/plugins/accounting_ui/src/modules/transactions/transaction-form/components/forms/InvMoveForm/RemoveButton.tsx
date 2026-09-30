import { IconX } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useWatch } from 'react-hook-form';
import {
  ITransactionGroupForm,
  TInvMoveJournal,
} from '../../../types/JournalForms';

export const RemoveButton = ({
  form,
  journalIndex,
}: {
  form: ITransactionGroupForm;
  journalIndex: number;
}) => {
  const trDoc = useWatch({
    control: form.control,
    name: `trDocs.${journalIndex}`,
  }) as TInvMoveJournal;
  const details = trDoc.details;

  if (!details.filter((d) => d.checked).length) return null;

  const handleRemove = () => {
    form.setValue(
      `trDocs.${journalIndex}.details`,
      details.filter((d) => !d.checked),
    );
  };

  return (
    <Button
      variant="secondary"
      className="bg-destructive/10 text-destructive"
      onClick={handleRemove}
    >
      <IconX />
      Сонгосныг хасах
    </Button>
  );
};
