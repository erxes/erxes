import { DocumentSheet } from '@/documents/components/DocumentSheet';
import { IconCube } from '@tabler/icons-react';

import { Breadcrumb, Button, Separator } from 'erxes-ui';
import { Link } from 'react-router-dom';
import { PageHeader } from 'ui-modules';

export const DocumentsHeader = () => {
  return (
    <PageHeader>
      <PageHeader.Start>
        <Breadcrumb>
          <Breadcrumb.List className="gap-1">
            <Breadcrumb.Item>
              <Button variant="ghost" asChild>
                <Link to="/documents">
                  <IconCube />
                  Documents
                </Link>
              </Button>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb>
        <Separator.Inline />
        <PageHeader.FavoriteToggleButton />
      </PageHeader.Start>

      <PageHeader.End>
        <DocumentSheet />
      </PageHeader.End>
    </PageHeader>
  );
};
