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
  let title = t('not-found-title', 'Nothing here');
  if (waiting) {
    title = t('loading', 'Loading…');
  } else if (!entry.allowed) {
    title = t('access-denied', 'Access denied');
  } else if (error) {
    title = t('error', 'Unable to load editor');
  }
  const content =
    !waiting && entry.allowed && (error ? errorState : notFoundState);
  return (
    <>
      <RecordSidePanel.Header title={title} {...entry.headerProps} />
      {waiting ? (
        <Spinner containerClassName="py-12" />
      ) : (
        content || <PanelEmptyState title={title} />
      )}
    </>
  );
};

export const PanelEmptyState = ({
  title,
  description,
  action,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}) => (
  <Empty>
    <Empty.Header>
      <Empty.Title>{title}</Empty.Title>
      {description && <Empty.Description>{description}</Empty.Description>}
    </Empty.Header>
    {action && <Empty.Content>{action}</Empty.Content>}
  </Empty>
);
