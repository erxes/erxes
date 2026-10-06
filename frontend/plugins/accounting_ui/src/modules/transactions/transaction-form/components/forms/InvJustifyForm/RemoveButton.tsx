import { useTranslation } from 'react-i18next';
import { IconX } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useWatch } from 'react-hook-form';
import { ITransactionGroupForm } from '../../../types/JournalForms';

export const RemoveButton = ({
  form,
  journalIndex,
}: {
  form: ITransactionGroupForm;
  journalIndex: number;
}) => {
  const { t } = useTranslation('accounting');

  const details = useWatch({
    control: form.control,
    name: `trDocs.${journalIndex}.details`,
  });

  if (!details.filter((detail) => detail.checked).length) return null;

  return (
    <Button
      variant="secondary"
      className="bg-destructive/10 text-destructive"
      onClick={() =>
        form.setValue(
          `trDocs.${journalIndex}.details`,
          details.filter((detail) => !detail.checked),
        )
      }
    >
      <IconX />
      {t('remove-selected-rows')}
    </Button>
  );
};
