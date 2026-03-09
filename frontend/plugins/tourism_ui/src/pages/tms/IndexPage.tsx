import { IconBox } from '@tabler/icons-react';
import { Breadcrumb, Button, Separator } from 'erxes-ui';
import { PageHeader } from 'ui-modules';
import { Link } from 'react-router-dom';
import { TmsCreateSheet } from '@/tms/components/CreateTmsSheet';
import { BranchList } from '@/tms/components/BranchList';

export const IndexPage = () => {
  return (
    <div className="flex flex-col h-full">
      <PageHeader>
        <PageHeader.Start>
          <Breadcrumb>
            <Breadcrumb.List className="gap-1">
              <Breadcrumb.Item>
                <Button variant="ghost" asChild>
                  <Link to="/tms">
                    <IconBox />
                    Tour management system
                  </Link>
                </Button>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb>
          <Separator.Inline />
          <PageHeader.FavoriteToggleButton />
        </PageHeader.Start>
        <PageHeader.End>
          {/* <Button variant="outline" asChild>
            <Link to="/settings/tms">
              <IconSettings />
              Go to settings
            </Link>
          </Button> */}

          <TmsCreateSheet />
        </PageHeader.End>
      </PageHeader>

      <div>
        <BranchList />
      </div>
    </div>
  );
};
