import { useDocumentRemove } from '@/documents/hooks/useDocumentRemove';
import {
  IconCalendarPlus,
  IconDotsVertical,
  IconTrash,
} from '@tabler/icons-react';
import dayjs from 'dayjs';
import {
  AlertDialog,
  Button,
  Card,
  DropdownMenu,
  RelativeDateDisplay,
  useSetQueryStateByKey,
} from 'erxes-ui';
import { useState } from 'react';
import { Can, MembersInline } from 'ui-modules';
import { DocumentPreview } from './DocumentPreview';

export const DocumentsGrid = ({ documents }: { documents: any[] }) => {
  const setQuery = useSetQueryStateByKey();
  const { removeDocument } = useDocumentRemove();
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);

  const handleOpenDocument = (document: any) => {
    setQuery('documentId', document._id);
    setQuery('contentType', document.contentType);
  };

  const handleDeleteDocument = () => {
    removeDocument({
      variables: { id: documentToDelete },
      refetchQueries: ['Documents'],
    });
    setDocumentToDelete(null);
  };

  return (
    <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {documents.map((document) => (
        <Card
          key={document._id}
          className="group flex cursor-pointer flex-col overflow-hidden transition-shadow hover:shadow-md"
          onClick={() => handleOpenDocument(document)}
        >
          <Card.Content className="relative flex h-40 items-center justify-center overflow-hidden border-b bg-muted/30 p-0">
            <DocumentPreview document={document} />
          </Card.Content>

          <div className="flex items-start justify-between gap-2 p-4">
            <h3 className="truncate text-sm font-semibold leading-tight">
              {document.name || 'Untitled'}
            </h3>
            <Can action="removeDocuments">
              <DropdownMenu>
                <DropdownMenu.Trigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="-mr-1 -mt-1 size-7 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100"
                  >
                    <IconDotsVertical />
                  </Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content
                  align="end"
                  onClick={(e) => e.stopPropagation()}
                >
                  <DropdownMenu.Item
                    className="text-destructive focus:text-destructive"
                    onSelect={() => setDocumentToDelete(document._id)}
                  >
                    <IconTrash />
                    Delete
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu>
            </Can>
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
            <MembersInline.Provider members={[document.createdUser || {}]}>
              <MembersInline.Avatar size="lg" />
            </MembersInline.Provider>
          </Card.Footer>
        </Card>
      ))}
      <AlertDialog
        open={!!documentToDelete}
        onOpenChange={() => setDocumentToDelete(null)}
      >
        <AlertDialog.Content>
          <AlertDialog.Header>
            <AlertDialog.Title>Delete document</AlertDialog.Title>
            <AlertDialog.Description>
              This document will be permanently deleted. This action cannot be
              undone.
            </AlertDialog.Description>
          </AlertDialog.Header>
          <AlertDialog.Footer>
            <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
            <AlertDialog.Action onClick={handleDeleteDocument}>
              Delete document
            </AlertDialog.Action>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog>
    </div>
  );
};
