import { Empty, Spinner } from 'erxes-ui';
import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { RecordSidePanel } from 'ui-modules';
import { type PagePanelEntry } from '@/side-panel/hooks/usePagePanel';

export const PagePanelStatus = ({
  entry,
  loading,
  error,
  errorState,
  notFoundState,
}: {
  entry: PagePanelEntry;
  loading?: boolean;
  error?: boolean;
  errorState?: ReactNode;
  notFoundState?: ReactNode;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'side-panel' });
  const waiting = !entry.permissionsLoaded || loading;
  const title = waiting
    ? t('loading', 'Loading…')
    : !entry.allowed
    ? t('access-denied', 'Access denied')
    : error
    ? t('error', 'Unable to load editor')
    : t('not-found-title', 'Nothing here');
  const content =
    !waiting && entry.allowed && (error ? errorState : notFoundState);
  return (
    <>
      <RecordSidePanel.Header
        title={title}
        onBack={entry.onBack}
        onClose={entry.onClose}
        expanded={entry.expanded}
        onExpand={entry.onExpand}
      />
      {waiting ? (
        <Spinner containerClassName="py-12" />
      ) : (
        content || (
          <Empty>
            <Empty.Header>
              <Empty.Title>{title}</Empty.Title>
            </Empty.Header>
          </Empty>
        )
      )}
    </>
  );
};
