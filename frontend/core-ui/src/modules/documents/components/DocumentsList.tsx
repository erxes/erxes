import { IconArrowLeft } from '@tabler/icons-react';
import { Sidebar, useQueryState, useRemoveQueryStateByKey } from 'erxes-ui';

export const DocumentsList = ({ documents }: { documents: any }) => {
  const [documentId, setDocumentId] = useQueryState('documentId');

  const removeQuery = useRemoveQueryStateByKey();

  return (
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
                className="whitespace-nowrap truncate"
                onClick={() => setDocumentId(_id)}
              >
                {name}
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>
          ))}
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  );
};
