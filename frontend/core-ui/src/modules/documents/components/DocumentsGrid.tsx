import { IconCalendarPlus, IconFileText } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { Card, RelativeDateDisplay, useSetQueryStateByKey } from 'erxes-ui';
import { MembersInline } from 'ui-modules';
import { DOCUMENTS_TYPES_SET } from '../constants';
import { IDocument } from '../types';
import { DocumentPreview } from './DocumentPreview';
import { DocumentsActions } from './DocumentsActions';

export const DocumentsGrid = ({ documents }: { documents: IDocument[] }) => {
  const setQuery = useSetQueryStateByKey();

  const handleOpenDocument = (document: IDocument) => {
    setQuery('documentId', document._id);
    setQuery('contentType', document.contentType);
  };

  return (
    <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {documents.map((document) => {
        const documentType = DOCUMENTS_TYPES_SET[document.contentType];
        const DocumentTypeIcon = documentType?.icon ?? IconFileText;
        const documentTypeLabel = documentType?.label ?? document.contentType;

        return (
          <Card
            key={document._id}
            className="group flex cursor-pointer flex-col overflow-hidden transition-shadow hover:shadow-md"
            onClick={() => handleOpenDocument(document)}
          >
            <Card.Content className="relative flex h-40 items-center justify-center overflow-hidden border-b bg-muted/30 p-0">
              <DocumentPreview document={document} />
              <span
                className={`text-xs py-1 px-2 ${
                  documentType?.color ?? ''
                } border whitespace-nowrap absolute top-0 right-0 mt-2 mr-2 rounded-lg`}
              >
                {documentTypeLabel}
              </span>
            </Card.Content>

            <div className="flex items-start justify-between gap-2 p-4">
              <div className="flex min-w-0 items-center gap-2">
                <div
                  className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground"
                  title={documentTypeLabel}
                >
                  <DocumentTypeIcon className="size-4" />
                </div>
                <h3 className="truncate text-sm font-semibold leading-tight">
                  {document.name || 'Untitled'}
                </h3>
              </div>
              <DocumentsActions documentItem={document} variant="grid" />
            </div>

            <Card.Footer className="flex items-center justify-between border-t px-4 py-3">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <IconCalendarPlus size={16} />
                <span className="text-xs">
                  {document.createdAt ? (
                    <RelativeDateDisplay.Value
                      value={dayjs(document.createdAt as string).format(
                        'YYYY-MM-DD HH:mm:ss',
                      )}
                    />
                  ) : (
                    'N/A'
                  )}
                </span>
              </div>
              <MembersInline.Provider
                members={document.createdUser ? [document.createdUser] : []}
              >
                <MembersInline.Avatar size="lg" />
              </MembersInline.Provider>
            </Card.Footer>
          </Card>
        );
      })}
    </div>
  );
};
