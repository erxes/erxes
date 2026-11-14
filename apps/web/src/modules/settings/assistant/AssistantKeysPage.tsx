import { AssistantProvider } from '@erxes/core-contract';
import { IconSparkles } from '@tabler/icons-react';
import { skipToken, useQuery } from '@tanstack/react-query';
import { PageContainer, PageHeader, ScrollArea } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { AppBreadcrumb } from '~/components/AppBreadcrumb';
import { QueryState } from '~/components/QueryState';
import { orpc } from '@erxes/core-contract/client';
import { paths } from '~/lib/paths';
import { useCan } from '~/modules/auth/session';
import { ProviderKeyCard } from './ProviderKeyCard';

export const AssistantKeysPage = () => {
  const { t } = useTranslation('assistant', { keyPrefix: 'settings' });
  const canChat = useCan()('assistant.chat');

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
              { label: t('title', 'Assistant'), to: paths.settings.assistant, icon: IconSparkles },
            ]}
          />
        </PageHeader.Start>
      </PageHeader>
      <ScrollArea className="flex-1">
        <div className="mx-auto flex max-w-2xl flex-col gap-4 p-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-lg font-semibold">{t('keys-title', 'Provider keys')}</h1>
            <p className="text-sm text-muted-foreground">
              {t(
                'keys-intro',
                'The assistant runs on your own key. Only you can use it, and the assistant can do only what your role allows.',
              )}
            </p>
          </div>
          <QueryState query={connections}>
            {({ data }) =>
              AssistantProvider.options.map((provider) => (
                <ProviderKeyCard
                  key={provider}
                  provider={provider}
                  connection={data.find((row) => row.provider === provider)}
                  entry={catalog.data?.data.find((row) => row.provider === provider)}
                />
              ))
            }
          </QueryState>
        </div>
      </ScrollArea>
    </PageContainer>
  );
};
