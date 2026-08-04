import { IconArrowLeft } from '@tabler/icons-react';
import { Sidebar, useQueryState, useRemoveQueryStateByKey } from 'erxes-ui';

export const DocumentsList = ({ documents }: { documents: any }) => {
  const [documentId, setDocumentId] = useQueryState('documentId');

  const removeQuery = useRemoveQueryStateByKey();

  return (
    <Sidebar collapsible="none" className="w-full border-r bg-muted/20">
      <Sidebar.Group>
        <Sidebar.GroupLabel
          className="h-12 cursor-pointer gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground hover:text-foreground"
          onClick={() => {
            removeQuery('documentId');
          }}
        >
          <IconArrowLeft />
          All documents
        </Sidebar.GroupLabel>
        <Sidebar.GroupContent>
          <Sidebar.Menu>
            {documents.map(({ _id, name }: any) => (
              <Sidebar.MenuItem key={_id}>
                <Sidebar.MenuButton
                  isActive={_id === documentId}
                  onClick={() => setDocumentId(_id)}
                >
                  <span className="truncate">{name || 'Untitled'}</span>
                </Sidebar.MenuButton>
              </Sidebar.MenuItem>
            ))}
          </Sidebar.Menu>
        </Sidebar.GroupContent>
      </Sidebar.Group>
    </Sidebar>
  );
};
