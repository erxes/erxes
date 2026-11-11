import type { Automation, AutomationDefinition } from '@erxes/core-contract';
import { IconBolt, IconDeviceFloppy, IconPlayerPause, IconPlayerPlay, IconTrash } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge, Button, Input, Label, PageContainer, ScrollArea, Select, Spinner, Tabs, Textarea, useToast } from 'erxes-ui';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from 'ui-modules';
import { AppBreadcrumb } from '~/components/AppBreadcrumb';
import { api, isApiError, messageOf } from '~/lib/api';
import { useCan } from '~/modules/auth/session';
import { ConditionsEditor } from './builder/ConditionsEditor';
import { StepsEditor } from './builder/StepsEditor';
import { RunsPanel } from './RunsPanel';

/**
 * One automation: its builder (trigger, conditions, steps, re-entry) and its
 * runs. Saving an active automation publishes a new version at once (runs in
 * progress keep theirs).
 */
export const AutomationEditorPage = () => {
  const { id = '' } = useParams();
  const { t } = useTranslation('automations');
  const { toast } = useToast();
  const navigate = useNavigate();
  const client = useQueryClient();
  const can = useCan();
  const editable = can('automations.manage');
  const { data: automation, isLoading } = useQuery({ queryKey: ['automations', id], queryFn: () => api.automations.get({ id }) });
  const catalog = useQuery({ queryKey: ['automations', 'catalog'], queryFn: () => api.automations.catalog(), staleTime: 60_000 });
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [definition, setDefinition] = useState<AutomationDefinition | null>(null);
  const [problems, setProblems] = useState<string[]>([]);

  useEffect(() => {
    if (!automation) return;

    setName(automation.name);
    setDescription(automation.description ?? '');
    setDefinition(automation.definition);
  }, [automation]);

  const refresh = (next: Automation) => {
    client.setQueryData(['automations', id], next);
    void client.invalidateQueries({ queryKey: ['automations', 'list'] });
  };
  const onError = (error: unknown) => {
    const list = isApiError(error, 'INVALID_AUTOMATION') ? ((error.data as { problems?: string[] })?.problems ?? []) : [];

    setProblems(list);
    toast({ variant: 'destructive', title: t('failed', 'Something went wrong'), description: messageOf(error) });
  };
  const save = useMutation({
    mutationFn: () => api.automations.update({ id, name, description: description || null, definition: definition! }),
    onSuccess: (next) => {
      setProblems([]);
      refresh(next);
      toast({ title: next.status === 'active' ? t('published', 'Saved and published') : t('saved', 'Saved') });
    },
    onError,
  });
  const activate = useMutation({
    mutationFn: async () => {
      await api.automations.update({ id, name, description: description || null, definition: definition! });

      return api.automations.activate({ id });
    },
    onSuccess: (next) => {
      setProblems([]);
      refresh(next);
      toast({ title: t('activated', 'Turned on') });
    },
    onError,
  });
  const pause = useMutation({ mutationFn: () => api.automations.pause({ id }), onSuccess: refresh, onError });
  const remove = useMutation({
    mutationFn: () => api.automations.remove({ id }),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ['automations', 'list'] });
      navigate('/automations');
    },
    onError,
  });

  if (isLoading || !automation || !definition || !catalog.data) return <Spinner containerClassName="py-12" />;

  const trigger = catalog.data.triggers.find((item) => item.type === definition.trigger.event);
  const subject = trigger?.subject ?? 'customer';
  const actions = catalog.data.actions.filter(
    (action) => !action.subject || action.subject === 'any' || !trigger?.subject || action.subject === trigger.subject,
  );

  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <AppBreadcrumb
            items={[
              { label: t('title', 'Automations'), to: '/automations', icon: IconBolt },
              { label: automation.name, to: `/automations/${id}` },
            ]}
          />
          <Badge variant={automation.status === 'active' ? 'success' : automation.status === 'paused' ? 'warning' : 'secondary'}>
            {t(`automation-status.${automation.status}`, automation.status)}
            {automation.activeVersion ? ` · v${automation.activeVersion}` : ''}
          </Badge>
        </PageHeader.Start>
        {editable && (
          <PageHeader.End>
            <Button variant="ghost" disabled={remove.isPending} onClick={() => remove.mutate()}>
              <IconTrash />
            </Button>
            <Button variant="outline" disabled={save.isPending} onClick={() => save.mutate()}>
              <IconDeviceFloppy />
              {automation.status === 'active' ? t('publish', 'Save and publish') : t('save', 'Save')}
            </Button>
            {automation.status === 'active' ? (
              <Button variant="outline" disabled={pause.isPending} onClick={() => pause.mutate()}>
                <IconPlayerPause />
                {t('pause', 'Pause')}
              </Button>
            ) : (
              <Button disabled={activate.isPending} onClick={() => activate.mutate()}>
                <IconPlayerPlay />
                {t('activate', 'Turn on')}
              </Button>
            )}
          </PageHeader.End>
        )}
      </PageHeader>
      <Tabs defaultValue="build" className="flex min-h-0 flex-1 flex-col">
        <div className="border-b px-4">
          <Tabs.List className="h-9 border-b-0">
            <Tabs.Trigger value="build">{t('build', 'Build')}</Tabs.Trigger>
            <Tabs.Trigger value="runs">
              {t('runs', 'Runs')} ({automation.stats.running + automation.stats.succeeded + automation.stats.failed})
            </Tabs.Trigger>
          </Tabs.List>
        </div>
        <Tabs.Content value="build" className="mt-0 min-h-0 flex-1">
          <ScrollArea className="h-full">
            <div className="mx-auto max-w-3xl space-y-6 p-6">
              {problems.length > 0 && (
                <ul className="list-disc rounded-md border border-destructive/40 bg-destructive/5 p-3 pl-7 text-sm text-destructive">
                  {problems.map((problem) => (
                    <li key={problem}>{problem}</li>
                  ))}
                </ul>
              )}
              <section className="space-y-2">
                <Input value={name} disabled={!editable} onChange={(event) => setName(event.target.value)} className="text-base font-medium" />
                <Textarea
                  rows={2}
                  value={description}
                  disabled={!editable}
                  placeholder={t('description-placeholder', 'What does it do, and why?')}
                  onChange={(event) => setDescription(event.target.value)}
                />
              </section>
              <section className="space-y-3 rounded-lg border p-4">
                <h2 className="text-sm font-medium">{t('trigger', 'When this happens')}</h2>
                <Select
                  value={definition.trigger.event}
                  disabled={!editable}
                  onValueChange={(event) => setDefinition({ ...definition, trigger: { ...definition.trigger, event } })}
                >
                  <Select.Trigger>
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Content>
                    {catalog.data.triggers.map((item) => (
                      <Select.Item key={item.type} value={item.type}>
                        {item.label}
                        {item.source !== 'core' ? ` (${item.source})` : ''}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
                <Label className="text-xs text-muted-foreground">{t('only-if', 'Only if')}</Label>
                <ConditionsEditor
                  value={definition.trigger.conditions}
                  disabled={!editable}
                  onChange={(conditions) => setDefinition({ ...definition, trigger: { ...definition.trigger, conditions } })}
                />
                <div className="flex items-center gap-2 pt-2 text-sm">
                  <span>{t('reentry', 'The same record may run through')}</span>
                  <Select
                    value={definition.reentry}
                    disabled={!editable}
                    onValueChange={(reentry) => setDefinition({ ...definition, reentry: reentry as AutomationDefinition['reentry'] })}
                  >
                    <Select.Trigger className="h-8 w-40">
                      <Select.Value />
                    </Select.Trigger>
                    <Select.Content>
                      <Select.Item value="always">{t('reentry-always', 'every time')}</Select.Item>
                      <Select.Item value="daily">{t('reentry-daily', 'once a day')}</Select.Item>
                      <Select.Item value="once">{t('reentry-once', 'only once')}</Select.Item>
                    </Select.Content>
                  </Select>
                </div>
              </section>
              <section className="space-y-3">
                <h2 className="text-sm font-medium">{t('then-do', 'Then do this')}</h2>
                <StepsEditor
                  steps={definition.steps}
                  actions={actions}
                  subject={subject}
                  disabled={!editable}
                  onChange={(steps) => setDefinition({ ...definition, steps })}
                />
              </section>
            </div>
          </ScrollArea>
        </Tabs.Content>
        <Tabs.Content value="runs" className="mt-0 flex min-h-0 flex-1">
          <RunsPanel automationId={id} />
        </Tabs.Content>
      </Tabs>
    </PageContainer>
  );
};
