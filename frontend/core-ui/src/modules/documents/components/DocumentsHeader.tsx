import { DocumentSheet } from '@/documents/components/DocumentSheet';
import { useDocument } from '@/documents/hooks/useDocument';
import { useDocumentsTypes } from '@/documents/hooks/useDocumentsTypes';
import { IconCube, IconPrinter } from '@tabler/icons-react';

import { Breadcrumb, Button, Separator, useQueryState } from 'erxes-ui';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ApprovalLockGuard,
  Can,
  PageHeader,
  PrintDocument,
  createFavoriteBreadcrumb,
} from 'ui-modules';
import { DOCUMENT_APPROVAL_CONTENT_TYPE } from '../constants';
import {
  DocumentPrintDialog,
  hasDocumentReplacerSelect,
} from './DocumentPrintDialog';

export const DocumentsHeader = () => {
  const [documentId] = useQueryState<string>('documentId');
  const cleanDocumentId = documentId?.trim();
  const [contentType] = useQueryState<string>('contentType');
  const { document, hasError, loading } = useDocument();
  const [printOpen, setPrintOpen] = useState(false);
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
        {cleanDocumentId && document && !loading && !hasError && (
          <Can action="documentsRead">
            {hasDocumentReplacerSelect(document.contentType) ? (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setPrintOpen(true)}
                >
                  <IconPrinter /> Print
                </Button>
                <DocumentPrintDialog
                  documentItem={document}
                  open={printOpen}
                  onOpenChange={setPrintOpen}
                />
              </>
            ) : (
              <PrintDocument
                items={[]}
                contentType={document.contentType}
                document={{ _id: document._id, name: document.name }}
              />
            )}
          </Can>
        )}
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
