import { IconPlus } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { AddTransaction } from '@/transactions/components/AddTransaction';

// The page header already renders an AddTransaction that owns the `C` hotkey,
// so the empty-state copy disables its own hotkey to avoid opening twice.
export const AddTransactionEmptyAction = () => {
  const { t } = useTranslation('accounting');

  return (
    <AddTransaction disableHotkey>
      <Button>
        <IconPlus />
        {t('add-transaction-label')}
      </Button>
    </AddTransaction>
  );
};
