import type { ApiKey } from '@erxes/core-contract';
import { orpc } from '@erxes/core-contract/client';
import { IconKey, IconPlus } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { Button, Empty, PageContainer, PageHeader, PageSubHeader, RecordTable } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { AppBreadcrumb } from '~/components/AppBreadcrumb';
import { QueryState } from '~/components/QueryState';
import { paths } from '~/lib/paths';
import { useCan } from '~/modules/auth/session';
import { apiKeyColumns } from './apiKeyColumns';

const NoKeys = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'api-keys' });

  return (
    <Empty>
      <Empty.Header>
        <Empty.Media variant="icon">
          <IconKey />
        </Empty.Media>
        <Empty.Title>{t('empty', 'No API keys yet')}</Empty.Title>
        <Empty.Description>
          {t('empty-description', 'Scripts and other systems call the API with a key.')}
        </Empty.Description>
      </Empty.Header>
    </Empty>
  );
};

const KeyTable = ({ keys, everyone }: { keys: ApiKey[]; everyone: boolean }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'api-keys' });

  return (
    <RecordTable.Provider
      key={String(everyone)}
      columns={apiKeyColumns(t, everyone)}
      data={keys}
      className="m-3"
      tableId="core_api_keys"
    >
      <RecordTable.CursorProvider
        dataLength={keys.length}
        hasNextPage={false}
        hasPreviousPage={false}
      >
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            <RecordTable.RowList />
          </RecordTable.Body>
        </RecordTable>
      </RecordTable.CursorProvider>
    </RecordTable.Provider>
  );
};

/** Settings › API keys: the organisation's keys, each with what it can do. */
export const ApiKeysPage = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'api-keys' });
  const can = useCan();
  const keys = useQuery(orpc.apiKeys.list.queryOptions());

  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <AppBreadcrumb
            items={[{ label: t('title', 'API keys'), to: paths.settings.apiKeys, icon: IconKey }]}
          />
        </PageHeader.Start>
        <PageHeader.End>
          {can('api_keys.create') && (
            <Button render={<Link to={paths.settings.apiKeyNew} />}>
              <IconPlus />
              {t('add', 'Create key')}
            </Button>
          )}
        </PageHeader.End>
      </PageHeader>
      <PageSubHeader className="items-center">
        <span className="text-sm text-muted-foreground">
          {t(
            'intro',
            'Keys let other systems use erxes. A regular key works with data, a management key sets up the organisation. A key never does more than the person who made it.',
          )}
        </span>
      </PageSubHeader>
      <QueryState
        query={keys}
        className="py-12"
        isEmpty={({ data }) => !data.length}
        empty={<NoKeys />}
      >
        {({ data }) => <KeyTable keys={data} everyone={can('api_keys.manage')} />}
      </QueryState>
    </PageContainer>
  );
};
