import { IconCashRegister, IconPlus, IconSettings } from '@tabler/icons-react';
import { Breadcrumb, Button, Separator } from 'erxes-ui';
import { PageHeader } from 'ui-modules';
import { Link } from 'react-router-dom';
import { PosCardGrid } from '@/pos/components/PosRecordList';
import { PosCreate } from '~/modules/pos/components/pos-create';
import { PosFilter } from '~/modules/pos/pos/PosFilter';
import { useState } from 'react';

export const PosIndexPage = () => {
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
                  <Link to="/pos">
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
          <Button variant="outline" asChild>
            <Link to="/settings/pos">
              <IconSettings />
              Go to settings
            </Link>
          </Button>
          <Button onClick={onCreatePos}>
            <IconPlus className="mr-2 w-4 h-4" />
            Create POS
          </Button>
        </PageHeader.End>
      </PageHeader>
      <PageHeader>
        <PosFilter />
      </PageHeader>
      <PosCardGrid />

      <PosCreate open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
    </div>
  );
};
