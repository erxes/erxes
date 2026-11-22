import { AssistantProvider } from '@erxes/core-contract';
import { IconKey } from '@tabler/icons-react';
import { skipToken, useQuery } from '@tanstack/react-query';
import { PageContainer, PageHeader, ScrollArea, AppBreadcrumb } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { QueryState } from '~/components/QueryState';
import { orpc } from '@erxes/core-contract/client';
import { paths } from '~/lib/paths';
import { useCan } from '~/modules/auth/session';
import { ProviderKeyCard } from './ProviderKeyCard';

export const AssistantKeysPage = () => {
  const { t } = useTranslation('assistant', { keyPrefix: 'settings' });
  const can = useCan();
  const canChat = can('assistant.chat');
  const canManage = can('assistant.manage');

  const connections = useQuery(
    orpc.assistant.connections.queryOptions({ input: canChat ? undefined : skipToken }),
  );

  const catalog = useQuery({
    ...orpc.assistant.models.queryOptions(),
    enabled: Boolean(connections.data?.data.length),
  });

  if (!canChat) return <Navigate to={paths.settings.root} replace />;

  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <AppBreadcrumb
            items={[
              {
                label: t('title', 'Assistant provider keys'),
                to: paths.settings.assistant,
                icon: IconKey,
              },
            ]}
          />
        </PageHeader.Start>
      </PageHeader>
      <ScrollArea className="flex-1">
        <div className="mx-auto flex max-w-2xl flex-col gap-4 p-6">
          <p className="text-sm text-muted-foreground">
            {t(
              'keys-intro',
              "Every agent in the organisation runs on these keys. Only admins can change them, and the assistant still does only what each member's role allows.",
            )}
          </p>
          <QueryState query={connections}>
            {({ data }) =>
              AssistantProvider.options.map((provider) => (
                <ProviderKeyCard
                  key={provider}
                  provider={provider}
                  connection={data.find((row) => row.provider === provider)}
                  entry={catalog.data?.data.find((row) => row.provider === provider)}
                  canManage={canManage}
                />
              ))
            }
          </QueryState>
        </div>
      </ScrollArea>
    </PageContainer>
  );
};
