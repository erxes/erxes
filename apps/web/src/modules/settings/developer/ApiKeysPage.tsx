import type { ApiKey } from '@erxes/core-contract';
import { orpc } from '@erxes/core-contract/client';
import { IconKey, IconPlus, IconUser, IconWorldWww } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import {
  Button,
  DropdownMenu,
  Empty,
  PageContainer,
  PageHeader,
  PageSubHeader,
  RecordTable,
  AppBreadcrumb,
  Tabs,
} from 'erxes-ui';
import { parseAsStringLiteral, useQueryState } from 'nuqs';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { QueryState } from '~/components/QueryState';
import { paths } from '~/lib/paths';
import { useCan } from '~/modules/auth/session';
import { apiKeyColumns } from './apiKeyColumns';
import { NewPortalKey, PortalKeys } from './keys/PortalKeys';

const NoKeys = ({ title, description }: { title: string; description: string }) => (
  <Empty>
    <Empty.Header>
      <Empty.Media variant="icon">
        <IconKey />
      </Empty.Media>
      <Empty.Title>{title}</Empty.Title>
      <Empty.Description>{description}</Empty.Description>
    </Empty.Header>
  </Empty>
);

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

/** The keys of team members: each acts as the member who made it, within its rules. */
const MemberKeys = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'api-keys' });
  const can = useCan();
  const keys = useQuery(orpc.apiKeys.list.queryOptions());

  return (
    <QueryState
      query={keys}
      className="py-12"
      isEmpty={({ data }) => !data.length}
      empty={
        <NoKeys
          title={t('empty', 'No API keys yet')}
          description={t('empty-description', 'Scripts and other systems call the API with a key.')}
        />
      }
    >
      {({ data }) => <KeyTable keys={data} everyone={can('api_keys.manage')} />}
    </QueryState>
  );
};

const KEY_TABS = ['members', 'portal'] as const;

/** Create key: a team member key (its own page) or a portal's key (a dialog). */
const CreateKey = ({ onPortalKey }: { onPortalKey: () => void }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'api-keys' });
  const can = useCan();
  const navigate = useNavigate();

  if (!can('api_keys.create') && !can('portals.manage')) return null;

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger render={<Button />}>
        <IconPlus />
        {t('add', 'Create key')}
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end" className="w-72">
        {can('api_keys.create') && (
          <DropdownMenu.Item onClick={() => void navigate(paths.settings.apiKeyNew)}>
            <IconUser />
            <span>
              <span className="block">{t('member-key', 'Team member key')}</span>
              <span className="block text-xs text-muted-foreground">
                {t('member-key-help', 'Scripts and systems that work as you, within rules')}
              </span>
            </span>
          </DropdownMenu.Item>
        )}
        {can('portals.manage') && (
          <DropdownMenu.Item onClick={onPortalKey}>
            <IconWorldWww />
            <span>
              <span className="block">{t('portal-key', 'Portal key')}</span>
              <span className="block text-xs text-muted-foreground">
                {t('portal-key-help', 'A portal’s apps or server, for what its customers may see')}
              </span>
            </span>
          </DropdownMenu.Item>
        )}
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};

/**
 * Settings › API keys: team member keys, which act as their maker within rules, and customer
 * keys, which a portal's server uses for what its customers may see.
 */
export const ApiKeysPage = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'api-keys' });
  const can = useCan();
  const [tab, setTab] = useQueryState('tab', parseAsStringLiteral(KEY_TABS).withDefault('members'));
  const [creating, setCreating] = useState(false);
  const [secret, setSecret] = useState<string | null>(null);
  const portalKeys = can('portals.manage');

  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <AppBreadcrumb
            items={[{ label: t('title', 'API keys'), to: paths.settings.apiKeys, icon: IconKey }]}
          />
        </PageHeader.Start>
        <PageHeader.End>
          <CreateKey onPortalKey={() => setCreating(true)} />
        </PageHeader.End>
      </PageHeader>
      <PageSubHeader className="items-center">
        {portalKeys && (
          <Tabs value={tab} onValueChange={(next) => void setTab(next)}>
            <Tabs.List variant="flush" className="h-9">
              <Tabs.Trigger value="members">{t('tab-members', 'Team member keys')}</Tabs.Trigger>
              <Tabs.Trigger value="portal">{t('tab-portal', 'Portal keys')}</Tabs.Trigger>
            </Tabs.List>
          </Tabs>
        )}
        <span className="text-sm text-muted-foreground">
          {tab === 'portal' && portalKeys
            ? t(
                'intro-portal',
                'A portal key lets a portal’s apps (publishable) or its server (secret) call core and its plugins for what its customers and visitors may see. It never acts as a team member.',
              )
            : t(
                'intro',
                'Keys let other systems use erxes. A regular key works with data, a management key sets up the organisation. A key never does more than the person who made it.',
              )}
        </span>
      </PageSubHeader>
      {tab === 'portal' && portalKeys ? (
        <PortalKeys
          secret={secret}
          empty={
            <NoKeys
              title={t('portal-empty', 'No portal keys yet')}
              description={t(
                'portal-empty-description',
                'A portal’s web and mobile apps, or its server, call its plugins with one, for what customers and visitors may see.',
              )}
            />
          }
        />
      ) : (
        <MemberKeys />
      )}
      {portalKeys && (
        <NewPortalKey
          open={creating}
          onOpenChange={setCreating}
          onCreated={(made) => {
            setSecret(made.kind === 'secret' ? made.secret : null);
            void setTab('portal');
          }}
        />
      )}
    </PageContainer>
  );
};
