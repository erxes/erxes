import { DocumentSheet } from '@/documents/components/DocumentSheet';
import { IconCube } from '@tabler/icons-react';

import { Breadcrumb, Button, Separator } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Can, PageHeader } from 'ui-modules';

export const DocumentsHeader = () => {
  const { t } = useTranslation('documents');
  return (
    <PageHeader>
      <PageHeader.Start>
        <Breadcrumb>
          <Breadcrumb.List className="gap-1">
            <Breadcrumb.Item>
              <Button variant="ghost" asChild>
                <Link to="/documents">
                  <IconCube />
                  {t('documents', 'Documents')}
                </Link>
              </Button>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb>
        <Separator.Inline />
        <PageHeader.FavoriteToggleButton />
      </PageHeader.Start>

      <PageHeader.End>
        <Can action="manageDocuments">
          <DocumentSheet />
        </Can>
      </PageHeader.End>
    </PageHeader>
  );
};
