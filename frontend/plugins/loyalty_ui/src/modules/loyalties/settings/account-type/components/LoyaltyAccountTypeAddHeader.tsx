import { IconPlus } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from 'ui-modules';
import { LoyaltyAccountTypeFormSheet } from './LoyaltyAccountTypeFormSheet';

export const LoyaltyAccountTypeAddHeader = () => {
  const { t } = useTranslation('loyalty');
  const [open, setOpen] = useState(false);

  return (
    <PageHeader>
      <PageHeader.End>
        <Button onClick={() => setOpen(true)}>
          <IconPlus />
          {t('add-loyalty-account-type')}
        </Button>
        <LoyaltyAccountTypeFormSheet open={open} onOpenChange={setOpen} />
      </PageHeader.End>
    </PageHeader>
  );
};
