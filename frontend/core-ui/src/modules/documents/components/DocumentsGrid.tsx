import {
  AlertDialog,
  Card,
  RelativeDateDisplay,
  useSetQueryStateByKey,
} from 'erxes-ui';
import {
  IconCalendarPlus,
  IconChevronDown,
  IconTrash,
} from '@tabler/icons-react';
import { MembersInline } from 'ui-modules';
import { DocumentPreview } from './DocumentPreview';
import { useDocumentRemove } from '@/documents/hooks/useDocumentRemove';
import { useState } from 'react';
import dayjs from 'dayjs';

export const DocumentsGrid = ({ documents }: { documents: any[] }) => {
  const setQuery = useSetQueryStateByKey();
  const { removeDocument } = useDocumentRemove();
  const [isMenuOpen, setIsMenuOpen] = useState<number | null>(null);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);

  const toggleMenu = (index: number) => {
    setIsMenuOpen(isMenuOpen === index ? null : index);
  };

  const handleDeleteDocument = () => {
    removeDocument({
      variables: { id: documentToDelete },
      refetchQueries: ['Documents'],
    });
    setDocumentToDelete(null);
    setIsMenuOpen(null);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
      {documents.map((document, index) => (
        <Card
          key={document._id}
          className="flex flex-col overflow-hidden cursor-pointer"
          onClick={() => {
            setQuery('documentId', document._id);
            setQuery('contentType', document.contentType);
          }}
        >
          <div className="flex items-center justify-between p-3 relative">
            <h3 className="text-md font-medium text-black truncate flex-1 mr-2">
              {document.name}
            </h3>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleMenu(index);
              }}
              className="flex items-center leading-[100%] text-black font-inter gap-1 text-sm font-medium rounded-md px-1"
            >
              Action
              <IconChevronDown size={18} stroke={2} />
            </button>

            {isMenuOpen === index && (
              <div className="absolute right-3 top-12 py-1 bg-white rounded-lg shadow-lg border border-gray-100 w-[150px] z-10">
                <div
                  className="flex items-center w-full gap-3 px-4 py-2 text-left cursor-pointer hover:bg-gray-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDocumentToDelete(document._id);
                  }}
                >
                  <IconTrash size={16} stroke={1.5} />
                  <p className="text-sm font-medium leading-[100%] text-black font-inter">
                    Delete
                  </p>
                </div>
              </div>
            )}
          </div>
          <Card.Content className="p-0 relative flex items-center justify-center h-[140px]">
            <DocumentPreview document={document} />
          </Card.Content>

          <Card.Footer className="flex-auto p-4 border-t flex-col">
            <div className="w-full h-full flex flex-col justify-between">
              <Card.Description className="flex items-center justify-between self-stretch">
                <div className="flex items-center gap-2">
                  <IconCalendarPlus size={18} className="text-black" />
                  <p className="text-sm flex-shrink-0 text-muted-foreground leading-[100%]">
                    {document.createdAt ? (
                      <RelativeDateDisplay.Value
                        value={dayjs(document.createdAt as string).format(
                          'YYYY-MM-DD HH:mm:ss',
                        )}
                      />
                    ) : (
                      'N/A'
                    )}
                  </p>
                </div>
                <MembersInline.Provider members={[document.createdUser]}>
                  <MembersInline.Avatar size="lg" />
                </MembersInline.Provider>
              </Card.Description>
            </div>
          </Card.Footer>
        </Card>
      ))}
      <AlertDialog
        open={!!documentToDelete}
        onOpenChange={() => setDocumentToDelete(null)}
      >
        <AlertDialog.Content>
          <AlertDialog.Header>
            <AlertDialog.Title>Delete Document</AlertDialog.Title>
            <AlertDialog.Description>
              Are you sure you want to remove the document? This action cannot
              be undone.
            </AlertDialog.Description>
          </AlertDialog.Header>
          <AlertDialog.Footer>
            <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
            <AlertDialog.Action
              onClick={() => {
                handleDeleteDocument();
              }}
            >
              Yes, delete document
            </AlertDialog.Action>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog>
    </div>
  );
};
