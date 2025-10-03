import { IconCashRegister, IconPlus, IconSettings } from '@tabler/icons-react';
import { Breadcrumb, Button, Separator } from 'erxes-ui';
import { PageHeader } from 'ui-modules';
import { Link, useSearchParams } from 'react-router-dom';
import { PosRecordTable } from '@/pos/components/PosRecordTable';
import { useAtom } from 'jotai';
import { PosCreate } from '@/pos/create-pos/components/index/pos-create';
import { PosEdit } from '@/pos/pos-detail/components/posDetail';
import { renderingPosCreateAtom } from '@/pos/create-pos/states/renderingPosCreateAtom';

export const PosIndexPage = () => {
  const [, setSearchParams] = useSearchParams();
  const [, setRenderingPosCreate] = useAtom(renderingPosCreateAtom);

  const onCreatePos = () => {
    setRenderingPosCreate(true);
    setSearchParams({ create: 'true' });
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
            <IconPlus className="mr-2 h-4 w-4" />
            Create POS
          </Button>
        </PageHeader.End>
      </PageHeader>
      <PosCreate />
      <PosRecordTable />
      <PosEdit />
    </div>
  );
};
