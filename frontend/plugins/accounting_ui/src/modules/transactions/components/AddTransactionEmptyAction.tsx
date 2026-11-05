import { IconPlus } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { AddTransaction } from '@/transactions/components/AddTransaction';

export const AddTransactionEmptyAction = () => {
  const { t } = useTranslation('accounting');

  return (
    <AddTransaction disableHotkey>
      <Button variant="outline">
        <IconPlus />
        {t('add-transaction-label')}
      </Button>
    </AddTransaction>
  );
};
