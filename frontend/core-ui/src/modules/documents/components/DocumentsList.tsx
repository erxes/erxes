import { IconArrowLeft } from '@tabler/icons-react';
import { Sidebar, useQueryState } from 'erxes-ui';

import { ApprovalLockedBadge } from 'ui-modules';
import { useDocumentNavigation } from '../hooks/useDocumentNavigation';
import { IDocument } from '../types';

/** Show document navigation with approval-lock visibility indicators. */
export const DocumentsList = ({ documents }: { documents: IDocument[] }) => {
  const [documentId, setDocumentId] = useQueryState<string>('documentId');

  const { returnToDocuments } = useDocumentNavigation();

  return (
    <Sidebar
      collapsible="none"
      className="h-auto min-h-full w-full border-r bg-muted/20"
    >
      <Sidebar.Group>
        <Sidebar.GroupLabel
          className="h-12 cursor-pointer gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground hover:text-foreground"
          onClick={returnToDocuments}
        >
          <IconArrowLeft />
          Back to documents
        </Sidebar.GroupLabel>
        <Sidebar.GroupContent>
          <Sidebar.Menu>
            {documents.map(({ _id, name, approvalLockState }) => (
              <Sidebar.MenuItem key={_id}>
                <Sidebar.MenuButton
                  isActive={_id === documentId}
                  onClick={() => setDocumentId(_id)}
                >
                  <span className="truncate">{name || 'Untitled'}</span>
                  <ApprovalLockedBadge state={approvalLockState} />
                </Sidebar.MenuButton>
              </Sidebar.MenuItem>
            ))}
          </Sidebar.Menu>
        </Sidebar.GroupContent>
      </Sidebar.Group>
    </Sidebar>
  );
};
