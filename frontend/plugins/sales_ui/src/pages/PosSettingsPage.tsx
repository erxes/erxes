import { Button, PageContainer } from 'erxes-ui';
import { IconCashRegister, IconPlus } from '@tabler/icons-react';
import { PosCardGrid } from '@/pos/components/PosRecordList';
import { PosCreate } from '@/pos/components/pos-create';
import { SettingsHeader } from 'ui-modules';
import { useState } from 'react';

export const PosSettingsPage = () => {
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
              POS
            </Button>
            <Button onClick={onCreatePos}>
              <IconPlus className="mr-2 w-4 h-4" />
              Create POS
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
