import { IconCashRegister, IconPlus } from '@tabler/icons-react';
import { Breadcrumb, Button, Separator } from 'erxes-ui';
import { PageHeader } from 'ui-modules';
import { Link } from 'react-router-dom';
import { PosCardGrid } from '@/pos/components/PosRecordList';
import { PosCreate } from '~/modules/pos/components/pos-create';
import { useState } from 'react';

const Settings = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const onCreatePos = () => {
    setCreateDialogOpen(true);
  };

  return (
    <div className="flex flex-col h-full">
      <PageHeader>
        <PageHeader.Start>
          <Breadcrumb>
            <Breadcrumb.List className="gap-1">
              <Breadcrumb.Item>
                <Button variant="ghost" asChild>
                  <Link to="/sales/pos">
                    <IconCashRegister />
                    pos
                  </Link>
                </Button>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb>
          <Separator.Inline />
          <PageHeader.FavoriteToggleButton />
        </PageHeader.Start>
        <PageHeader.End>
          <Button onClick={onCreatePos}>
            <IconPlus className="mr-2 w-4 h-4" />
            Create POS
          </Button>
        </PageHeader.End>
      </PageHeader>

      <PosCardGrid onCreatePos={onCreatePos} />

      <PosCreate open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
    </div>
  );
};

export default Settings;
