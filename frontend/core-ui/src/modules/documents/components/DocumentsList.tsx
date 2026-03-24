import { IconArrowLeft } from '@tabler/icons-react';
import { Sidebar, useQueryState, useRemoveQueryStateByKey } from 'erxes-ui';

export const DocumentsList = ({ documents }: { documents: any }) => {
  const [documentId, setDocumentId] = useQueryState('documentId');

  const removeQuery = useRemoveQueryStateByKey();

  return (
    <Sidebar collapsible="none" className="w-full">
      <Sidebar.Group>
        <Sidebar.GroupLabel
          className="gap-2 cursor-pointer"
          onClick={() => {
            removeQuery('documentId');
          }}
        >
          <IconArrowLeft />
          Documents
        </Sidebar.GroupLabel>
        <Sidebar.GroupContent>
          <Sidebar.Menu>
            {documents.map(({ _id, name }: any) => (
              <Sidebar.MenuItem key={_id}>
                <Sidebar.MenuButton
                  isActive={_id === documentId}
                  onClick={() => setDocumentId(_id)}
                >
                  <span className="truncate">{name}</span>
                </Sidebar.MenuButton>
              </Sidebar.MenuItem>
            ))}
          </Sidebar.Menu>
        </Sidebar.GroupContent>
      </Sidebar.Group>
    </Sidebar>
  );
};
