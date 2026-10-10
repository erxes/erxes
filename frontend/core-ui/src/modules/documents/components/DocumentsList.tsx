import { IconArrowLeft } from '@tabler/icons-react';
import { Sidebar, useQueryState, useRemoveQueryStateByKey } from 'erxes-ui';

import { ApprovalLockedBadge } from 'ui-modules';
import { IDocument } from '../types';
import { useTranslation } from 'react-i18next';

/** Show document navigation with approval-lock visibility indicators. */
export const DocumentsList = ({ documents }: { documents: IDocument[] }) => {
  const { t } = useTranslation('documents', { keyPrefix: 'document' });
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
          {t('all-documents-list')}
        </Sidebar.GroupLabel>
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
