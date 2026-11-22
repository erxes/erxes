import type { AssistantProvider } from '@erxes/core-contract';
import { messageOf, orpc } from '@erxes/core-contract/client';
import { IconCheck, IconChevronDown, IconPlugConnected, IconSparkles } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, buttonVariants, Command, Empty, Popover, useToast } from 'erxes-ui';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { QueryState } from '~/components/QueryState';
import { paths } from '~/lib/paths';
import { ProviderModelGroups } from '~/modules/assistant/ModelPicker';
import { PROVIDER_LABELS } from '~/modules/assistant/providers';
import { OrgSettingsPage } from './OrgSettingsPage';

type Chosen = { provider: AssistantProvider; model: string } | null;

const NoProvider = () => {
  const { t } = useTranslation('assistant', { keyPrefix: 'settings' });

  return (
    <Empty variant="outline" size="sm">
      <Empty.Header>
        <Empty.Media variant="icon">
          <IconPlugConnected />
        </Empty.Media>
        <Empty.Title>{t('no-provider', 'No AI provider is connected')}</Empty.Title>
        <Empty.Description>
          {t(
            'no-provider-description',
            'Connect OpenAI, Anthropic or another AI provider in Integrations. The assistant and agents run on it.',
          )}
        </Empty.Description>
      </Empty.Header>
      <Empty.Content>
        <Link to={paths.settings.aiIntegrations} className={buttonVariants()}>
          {t('connect-provider', 'Connect an AI provider')}
        </Link>
      </Empty.Content>
    </Empty>
  );
};

const useSaveDefault = () => {
  const { t } = useTranslation('assistant', { keyPrefix: 'settings' });
  const { toast } = useToast();
  const client = useQueryClient();

  return useMutation(
    orpc.assistant.updateSettings.mutationOptions({
      onSuccess: () => {
        toast({ title: t('model-saved', 'Default model saved') });
        void client.invalidateQueries({ queryKey: orpc.assistant.settings.key() });
      },
      onError: (error) => toast({ variant: 'destructive', title: messageOf(error) }),
    }),
  );
};

const DefaultModelPicker = ({ chosen }: { chosen: Chosen }) => {
  const { t } = useTranslation('assistant', { keyPrefix: 'settings' });
  const [open, setOpen] = useState(false);
  const labelId = useId();
  const catalog = useQuery(orpc.assistant.models.queryOptions());
  const save = useSaveDefault();

  const pick = (next: Chosen) => {
    save.mutate(
      next
        ? { defaultProvider: next.provider, defaultModel: next.model }
        : { defaultProvider: null, defaultModel: null },
    );
    setOpen(false);
  };

  const automatic = t('model-automatic', 'Automatic');

  const modelName = (choice: NonNullable<Chosen>) =>
    catalog.data?.data
      .find((entry) => entry.provider === choice.provider)
      ?.models.find((model) => model.id === choice.model)?.name ?? choice.model;

  const name = chosen ? `${PROVIDER_LABELS[chosen.provider]} · ${modelName(chosen)}` : automatic;

  return (
    <section className="flex flex-col gap-2 rounded-lg border p-4">
      <h2 id={labelId} className="text-sm font-medium">
        {t('model-label', 'Default model')}
      </h2>
      <Popover open={open} onOpenChange={setOpen}>
        <Popover.Trigger
          disabled={save.isPending}
          aria-labelledby={labelId}
          render={<Button variant="outline" className="w-full justify-between" />}
        >
          <span className="truncate">{name}</span>
          <IconChevronDown aria-hidden className="size-4 shrink-0" />
        </Popover.Trigger>
        <Popover.Content variant="flush" align="start" className="w-80">
          <Command>
            <Command.Input placeholder={t('model-search', 'Find a model')} />
            <Command.List className="max-h-popup">
              <Command.Empty>
                {catalog.isPending
                  ? t('model-loading', 'Loading models…')
                  : t('model-none', 'No model matches.')}
              </Command.Empty>
              <Command.Group>
                <Command.Item value="automatic" onSelect={() => pick(null)}>
                  <span className="min-w-0 flex-1 truncate">{automatic}</span>
                  {!chosen && <IconCheck aria-hidden className="size-4" />}
                </Command.Item>
              </Command.Group>
              <ProviderModelGroups
                entries={catalog.data?.data ?? []}
                current={chosen}
                onPick={(provider, model) => pick({ provider, model })}
              />
            </Command.List>
          </Command>
        </Popover.Content>
      </Popover>
      <p className="text-sm text-muted-foreground">
        {chosen
          ? t(
              'model-chosen-help',
              'Members can still pick another model in the assistant. If this provider is disconnected, the oldest connected one is used.',
            )
          : t(
              'model-automatic-help',
              'Automatic uses the recommended model of the AI provider connected first. Members can still pick another model in the assistant.',
            )}
      </p>
    </section>
  );
};

const Connected = ({ providers }: { providers: AssistantProvider[] }) => {
  const { t } = useTranslation('assistant', { keyPrefix: 'settings' });

  return (
    <p className="text-sm text-muted-foreground">
      {t('connected-providers', 'Connected: {{providers}}.', {
        providers: providers.map((provider) => PROVIDER_LABELS[provider]).join(', '),
      })}{' '}
      <Link to={paths.settings.aiIntegrations} className="text-primary-text hover:underline">
        {t('manage-providers', 'Manage AI providers')}
      </Link>
    </p>
  );
};

export const AssistantModelPage = () => {
  const { t } = useTranslation('assistant', { keyPrefix: 'settings' });
  const providers = useQuery(orpc.assistant.providers.queryOptions());

  const crumb = {
    label: t('model-title', 'Default model'),
    to: paths.settings.assistantModel,
    icon: IconSparkles,
  };

  return (
    <OrgSettingsPage crumb={crumb}>
      {(settings) => (
        <div className="mx-auto flex max-w-2xl flex-col gap-4 p-6">
          <p className="text-sm text-muted-foreground">
            {t(
              'model-intro',
              'The model a new conversation starts on, and agents run on when none is chosen for them.',
            )}
          </p>
          <QueryState query={providers} isEmpty={({ data }) => !data.length} empty={<NoProvider />}>
            {({ data }) => {
              const connected = data.map(({ provider }) => provider);

              return (
                <QueryState query={settings}>
                  {({ defaultProvider, defaultModel }) => (
                    <>
                      <DefaultModelPicker
                        chosen={
                          defaultProvider && defaultModel && connected.includes(defaultProvider)
                            ? { provider: defaultProvider, model: defaultModel }
                            : null
                        }
                      />
                      <Connected providers={connected} />
                    </>
                  )}
                </QueryState>
              );
            }}
          </QueryState>
        </div>
      )}
    </OrgSettingsPage>
  );
};
