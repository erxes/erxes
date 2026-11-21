import { messageOf, orpc } from '@erxes/core-contract/client';
import { IconArrowLeft, IconRobot } from '@tabler/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, PageContainer, PageHeader, ScrollArea, Spinner, useToast } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AppBreadcrumb } from '~/components/AppBreadcrumb';
import { paths } from '~/lib/paths';
import { type KeyPlugin, useKeyPlugins } from '../developer/keys/useKeyPlugins';
import { AgentFields, type AgentDraft } from './AgentFields';
import { type Template, TEMPLATES, templateAccess } from './agentTemplates';

const TemplateCard = ({
  template,
  plugin,
  onPick,
}: {
  template: Template;
  plugin: KeyPlugin | undefined;
  onPick: () => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'agents' });
  const missing = template.plugin !== null && !plugin?.usable;
  const Icon = template.icon;

  return (
    <button
      type="button"
      disabled={missing}
      onClick={onPick}
      className="flex flex-col items-start gap-2 rounded-lg border bg-background p-4 text-left hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-background"
    >
      <Icon aria-hidden className="size-6" />
      <span className="font-medium">{t(`template.${template.id ?? 'blank'}`, template.title)}</span>
      <span className="text-sm text-muted-foreground">
        {t(`template.${template.id ?? 'blank'}-description`, template.description)}
      </span>
      {missing && (
        <span className="text-xs text-muted-foreground">
          {t('needs-plugin', 'Needs the {{plugin}} plugin', { plugin: template.plugin })}
        </span>
      )}
    </button>
  );
};

const AgentForm = ({ template, plugin }: { template: Template; plugin: KeyPlugin | undefined }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'agents' });
  const { toast } = useToast();
  const navigate = useNavigate();
  const client = useQueryClient();

  const [draft, setDraft] = useState<AgentDraft>({
    name: template.name,
    instructions: template.instructions,
    provider: null,
    model: null,
    customers: template.customers,
  });

  const create = useMutation(
    orpc.agents.create.mutationOptions({
      onSuccess: (agent) => {
        void client.invalidateQueries({ queryKey: orpc.agents.list.key() });
        void navigate(paths.settings.agentOf(agent.id));
      },
      onError: (failure) =>
        toast({
          variant: 'destructive',
          title: t('create-failed', 'Could not make the agent'),
          description: messageOf(failure),
        }),
    }),
  );

  const access = templateAccess(template, plugin);
  const opened = access.actions[plugin?.name ?? ''] ?? [];
  const labels = new Map(plugin?.actions.map(({ action, label }) => [action, label]));

  return (
    <div className="space-y-4">
      <AgentFields draft={draft} onChange={setDraft} />
      <div className="rounded-lg border bg-muted/40 p-4 text-sm">
        <p className="font-medium">{t('access-title', 'What it may read')}</p>
        <p className="text-muted-foreground">
          {opened.length
            ? opened.map((action) => labels.get(action) ?? action).join(', ')
            : t('access-none', 'Nothing yet. Choose on its Access tab after you make it.')}
        </p>
      </div>
      <div className="flex justify-end">
        <Button
          disabled={create.isPending || !draft.name.trim() || !draft.instructions.trim()}
          onClick={() => create.mutate({ ...draft, template: template.id, access })}
        >
          {create.isPending && <Spinner size="sm" />}
          {t('create', 'Make agent')}
        </Button>
      </div>
    </div>
  );
};

/** Settings › Agents › New: pick a template, then change its words and model. */
export const NewAgentPage = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'agents' });
  const { plugins, loading } = useKeyPlugins();
  const [picked, setPicked] = useState<Template | null>(null);
  const pluginOf = (template: Template) => plugins.find(({ name }) => name === template.plugin);

  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <AppBreadcrumb
            items={[
              { label: t('title', 'Agents'), to: paths.settings.agents, icon: IconRobot },
              { label: t('add', 'New agent'), to: paths.settings.agentNew },
            ]}
          />
        </PageHeader.Start>
      </PageHeader>
      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-3xl space-y-4 p-6">
          {loading ? (
            <Spinner className="mx-auto my-12" />
          ) : picked ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => setPicked(null)}>
                <IconArrowLeft />
                {t('templates', 'Templates')}
              </Button>
              <AgentForm template={picked} plugin={pluginOf(picked)} />
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                {t(
                  'templates-intro',
                  'Start from what it sells. Each template opens only what it needs to read, and you can change everything after.',
                )}
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {TEMPLATES.map((template) => (
                  <TemplateCard
                    key={template.id ?? 'blank'}
                    template={template}
                    plugin={pluginOf(template)}
                    onPick={() => setPicked(template)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </ScrollArea>
    </PageContainer>
  );
};
