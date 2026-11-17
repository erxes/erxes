import type { ApiKey } from '@erxes/core-contract';
import { orpc } from '@erxes/core-contract/client';
import { IconKey } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { Empty, PageContainer, PageHeader, PageSubHeader, RecordTable } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppBreadcrumb } from '~/components/AppBreadcrumb';
import { QueryState } from '~/components/QueryState';
import { ShownOnce } from '~/components/ShownOnce';
import { paths } from '~/lib/paths';
import { useCan } from '~/modules/auth/session';
import { apiKeyColumns } from './apiKeyColumns';
import { NewApiKey } from './NewApiKey';

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

/** Settings › API keys: keys that let a script call the API as the member who made them. */
export const ApiKeysPage = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'api-keys' });
  const can = useCan();
  const [key, setKey] = useState<string | null>(null);
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
          {can('api_keys.create') && <NewApiKey onCreated={setKey} />}
        </PageHeader.End>
      </PageHeader>
      <PageSubHeader className="items-center">
        <span className="text-sm text-muted-foreground">
          {t(
            'intro',
            'Send a key as "Authorization: Bearer <key>". It can call what its member can, and stops working when it expires, is revoked, or the member is disabled.',
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
      {key && (
        <ShownOnce
          value={key}
          title={t('key-title', 'Your API key')}
          description={t('key-description', "Copy it now: it won't be shown again.")}
          onClose={() => setKey(null)}
        />
      )}
    </PageContainer>
  );
};
