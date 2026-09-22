import { DocumentSheet } from '@/documents/components/DocumentSheet';
import { useDocumentsTypes } from '@/documents/hooks/useDocumentsTypes';
import { IconCube } from '@tabler/icons-react';

import { Breadcrumb, Button, Separator, useQueryState } from 'erxes-ui';
import { Link } from 'react-router-dom';
import {
  ApprovalLockGuard,
  Can,
  PageHeader,
  createFavoriteBreadcrumb,
} from 'ui-modules';
import { DOCUMENT_APPROVAL_CONTENT_TYPE } from '../constants';

export const DocumentsHeader = () => {
  const [documentId] = useQueryState<string>('documentId');
  const cleanDocumentId = documentId?.trim();
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
          {cleanDocumentId ? (
            <ApprovalLockGuard
              contentType={DOCUMENT_APPROVAL_CONTENT_TYPE}
              contentId={cleanDocumentId}
              action="edit"
              fallback={<span hidden />}
              loadingFallback={<span hidden />}
            >
              <DocumentSheet />
            </ApprovalLockGuard>
          ) : (
            <DocumentSheet />
          )}
        </Can>
      </PageHeader.End>
    </PageHeader>
  );
};
