import {
  Sidebar,
  useIsMobile,
  useQueryState,
  useRemoveQueryStateByKey,
} from 'erxes-ui';

import { ApprovalLockedBadge } from 'ui-modules';
import { IDocument } from '../types';
import { IconArrowLeft } from '@tabler/icons-react';

/** Show document navigation with approval-lock visibility indicators. */
export const DocumentsList = ({ documents }: { documents: IDocument[] }) => {
  const [documentId, setDocumentId] = useQueryState('documentId');
  const isMobile = useIsMobile();

  const removeQuery = useRemoveQueryStateByKey();

  return (
    <Sidebar collapsible="none" className="w-full bg-transparent">
      <Sidebar.Group>
        <div className="flex items-center">
          <Sidebar.GroupLabel
            className="h-12 min-w-0 flex-1 cursor-pointer gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground hover:text-foreground"
            onClick={() => {
              removeQuery('documentId');
            }}
          >
            <IconArrowLeft />
            All documents
          </Sidebar.GroupLabel>
          {isMobile && <Sidebar.PanelTrigger />}
        </div>
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
