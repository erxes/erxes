import type { Agent } from '@erxes/core-contract';
import { orpc } from '@erxes/core-contract/client';
import { IconPlus, IconRobot } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import {
  AppBreadcrumb,
  Badge,
  Button,
  Empty,
  PageContainer,
  PageHeader,
  ScrollArea,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { QueryState } from '~/components/QueryState';
import { paths } from '~/lib/paths';
import { useCan } from '~/modules/auth/session';
import { TEMPLATES } from './agentTemplates';

const NoAgents = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'agents' });

  return (
    <Empty>
      <Empty.Header>
        <Empty.Media variant="icon">
          <IconRobot />
        </Empty.Media>
        <Empty.Title>{t('empty', 'No agents yet')}</Empty.Title>
        <Empty.Description>
          {t(
            'empty-description',
            'Make one from a template to answer customers in the shop, the hotel or the help center.',
          )}
        </Empty.Description>
      </Empty.Header>
    </Empty>
  );
};

const AgentRow = ({ agent }: { agent: Agent }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'agents' });
  const template = TEMPLATES.find((candidate) => candidate.id === agent.template);
  const Icon = template?.icon ?? IconRobot;

  return (
    <Link
      to={paths.settings.agentOf(agent.id)}
      className="flex items-center gap-3 rounded-lg border bg-background p-4 hover:bg-accent"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
        <Icon aria-hidden className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium">{agent.name}</span>
        <span className="block truncate text-sm text-muted-foreground">
          {template?.title ?? t('blank', 'Blank')}
          {agent.model ? ` · ${agent.model}` : ''}
        </span>
      </span>
      {agent.portalId && <Badge variant="secondary">{t('for-customers', 'Customers')}</Badge>}
    </Link>
  );
};

/** Settings › Agents: the bots admins made, which plugins send customers' messages to. */
export const AgentsPage = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'agents' });
  const can = useCan();
  const agents = useQuery(orpc.agents.list.queryOptions());

  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <AppBreadcrumb
            items={[{ label: t('title', 'Agents'), to: paths.settings.agents, icon: IconRobot }]}
          />
        </PageHeader.Start>
        <PageHeader.End>
          {can('assistant.manage') && (
            <Button render={<Link to={paths.settings.agentNew} />}>
              <IconPlus />
              {t('add', 'New agent')}
            </Button>
          )}
        </PageHeader.End>
      </PageHeader>
      <ScrollArea className="flex-1">
        <div className="mx-auto flex max-w-3xl flex-col gap-3 p-6">
          <QueryState query={agents} isEmpty={({ data }) => !data.length} empty={<NoAgents />}>
            {({ data }) => data.map((agent) => <AgentRow key={agent.id} agent={agent} />)}
          </QueryState>
        </div>
      </ScrollArea>
    </PageContainer>
  );
};
