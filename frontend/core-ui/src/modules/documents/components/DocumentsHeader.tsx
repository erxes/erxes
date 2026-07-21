import { DocumentSheet } from '@/documents/components/DocumentSheet';
import { useDocumentsTypes } from '@/documents/hooks/useDocumentsTypes';
import { IconCube } from '@tabler/icons-react';

import { Breadcrumb, Button, Separator, useQueryState } from 'erxes-ui';
import { Link } from 'react-router-dom';
import { Can, PageHeader, createFavoriteBreadcrumb } from 'ui-modules';

export const DocumentsHeader = () => {
  const [contentType] = useQueryState<string>('contentType');
  const { documentsTypes } = useDocumentsTypes();
  const selectedDocumentType = documentsTypes.find(
    (documentType) => documentType.contentType === contentType,
  );
  const favoriteBreadcrumb = createFavoriteBreadcrumb(
    'Documents',
    selectedDocumentType?.label,
  );

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
        <PageHeader.FavoriteToggleButton
          breadcrumb={favoriteBreadcrumb}
          icon="IconFile"
        />
      </PageHeader.Start>

      <PageHeader.End>
        <Can action="manageDocuments">
          <DocumentSheet />
        </Can>
      </PageHeader.End>
    </PageHeader>
  );
};
