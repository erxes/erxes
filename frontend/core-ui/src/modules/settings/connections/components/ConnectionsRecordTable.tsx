import { IconAlertTriangle, IconPlug } from '@tabler/icons-react';
import { Button, Empty, RecordTable } from 'erxes-ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { connectionsColumns } from '@/settings/connections/components/ConnectionsColumns';
import { useConnections } from '@/settings/connections/hooks/useConnections';

export const ConnectionsRecordTable = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'connections' });
  const { connections, loading, error, refetch } = useConnections();
  const columns = useMemo(() => connectionsColumns(t), [t]);

  if (error && !connections.length) {
    return (
      <Empty className="m-3 min-h-[20rem]">
        <Empty.Header>
          <Empty.Media variant="icon">
            <IconAlertTriangle />
          </Empty.Media>
          <Empty.Title>
            {t('load-failed', 'Could not load connections')}
          </Empty.Title>
          <Empty.Description>{error.message}</Empty.Description>
        </Empty.Header>
        <Button variant="outline" onClick={() => refetch()}>
          {t('retry', 'Retry')}
        </Button>
      </Empty>
    );
  }

  if (!loading && !connections.length) {
    return (
      <Empty className="m-3 min-h-[20rem]">
        <Empty.Header>
          <Empty.Media variant="icon">
            <IconPlug />
          </Empty.Media>
          <Empty.Title>{t('empty-title', 'No connections yet')}</Empty.Title>
          <Empty.Description>
            {t(
              'empty-description',
              'Add the credentials your integrations use, once, and let plugins read them securely.',
            )}
          </Empty.Description>
        </Empty.Header>
      </Empty>
    );
  }

  return (
    <div
      className="contents"
      {...(loading
        ? { role: 'status', 'aria-label': t('loading', 'Loading connections') }
        : {})}
    >
      <RecordTable.Provider
        data={connections}
        columns={columns}
        stickyColumns={['name']}
        className="m-3"
      >
        <RecordTable.Scroll>
          <RecordTable>
            <RecordTable.Header />
            <RecordTable.Body>
              <RecordTable.RowList />
              {loading && <RecordTable.RowSkeleton rows={5} />}
            </RecordTable.Body>
          </RecordTable>
        </RecordTable.Scroll>
      </RecordTable.Provider>
    </div>
  );
};
