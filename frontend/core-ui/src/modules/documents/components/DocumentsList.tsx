import {
  Sidebar,
  useIsMobile,
  useQueryState,
  useRemoveQueryStateByKey,
} from 'erxes-ui';

import { ApprovalLockedBadge } from 'ui-modules';
import { IDocument } from '../types';
import { IconArrowLeft } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

export const DocumentsList = ({ documents }: { documents: IDocument[] }) => {
  const { t } = useTranslation('documents', { keyPrefix: 'document' });
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
            {t('all-documents-list')}
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
                  <span className="truncate">{name || t('untitled')}</span>
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
