import { Button, PageContainer } from 'erxes-ui';
import { IconCashRegister, IconPlus } from '@tabler/icons-react';
import { PosCardGrid } from '@/pos/components/PosRecordList';
import { PosCreate } from '@/pos/components/pos-create';
import { SettingsHeader } from 'ui-modules';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export const PosSettingsPage = () => {
  const { t } = useTranslation('sales');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const onCreatePos = () => {
    setCreateDialogOpen(true);
  };

  return (
    <PageContainer>
      <div className="flex overflow-hidden relative flex-col flex-1">
        <SettingsHeader breadcrumbs={[]}>
          <div className="flex justify-between items-center w-full">
            <Button variant="ghost" className="font-semibold">
              <IconCashRegister className="w-4 h-4 text-accent-foreground" />
              {t('pos')}
            </Button>
            <Button onClick={onCreatePos}>
              <IconPlus className="mr-2 w-4 h-4" />
              {t('pos-create')}
            </Button>
          </div>
        </SettingsHeader>
        <div className="flex overflow-hidden flex-auto w-full">
          <div className="flex overflow-hidden flex-col w-full">
            <PosCardGrid onCreatePos={onCreatePos} />
          </div>
        </div>
      </div>
      <PosCreate
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </PageContainer>
  );
};
