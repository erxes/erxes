import {
  IconClockHour4,
  IconCode,
  IconCpu,
  IconLock,
  IconShieldCheck,
  type TablerIcon,
} from '@tabler/icons-react';
import { skipToken, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PageContainer, PageHeader, ScrollArea, Switch, useToast } from 'erxes-ui';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { AppBreadcrumb } from '~/components/AppBreadcrumb';
import { QueryState } from '~/components/QueryState';
import { messageOf, orpc } from '~/lib/api';
import { useCan } from '~/modules/auth/session';

const CODE_MODE_PATH = '/settings/assistant-code-mode';

const Fact = ({ icon: Icon, text }: { icon: TablerIcon; text: string }) => (
  <li className="flex items-start gap-3 py-2">
    <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
    <span className="text-sm">{text}</span>
  </li>
);

const CodeModeSwitch = ({ enabled }: { enabled: boolean }) => {
  const { t } = useTranslation('assistant', { keyPrefix: 'settings' });
  const { toast } = useToast();
  const client = useQueryClient();
  const id = useId();

  const update = useMutation(
    orpc.assistant.updateSettings.mutationOptions({
      onSuccess: ({ codeMode }) => {
        toast({
          title: codeMode
            ? t('code-mode-on', 'Code mode is on')
            : t('code-mode-off', 'Code mode is off'),
        });
        void client.invalidateQueries({ queryKey: orpc.assistant.settings.key() });
      },
      onError: (error) => toast({ variant: 'destructive', title: messageOf(error) }),
    }),
  );

  return (
    <label htmlFor={id} className="flex items-center gap-4 rounded-lg border p-4">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <IconCode className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium">
          {t('code-mode-label', 'Let the assistant run code')}
        </span>
        <span className="block text-sm text-muted-foreground">
          {t(
            'code-mode-description',
            'For questions over many records, the assistant writes a short program that reads through the API and computes totals, shares and comparisons, then answers with the result.',
          )}
        </span>
      </span>
      <Switch
        id={id}
        checked={update.variables?.codeMode ?? enabled}
        disabled={update.isPending}
        onCheckedChange={(codeMode) => update.mutate({ codeMode })}
      />
    </label>
  );
};

export const AssistantCodeModePage = () => {
  const { t } = useTranslation('assistant', { keyPrefix: 'settings' });
  const canManage = useCan()('assistant.manage');

  const settings = useQuery(
    orpc.assistant.settings.queryOptions({ input: canManage ? undefined : skipToken }),
  );

  if (!canManage) return <Navigate to="/settings" replace />;

  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <AppBreadcrumb
            items={[
              {
                label: t('code-mode-title', 'Assistant code mode'),
                to: CODE_MODE_PATH,
                icon: IconCode,
              },
            ]}
          />
        </PageHeader.Start>
      </PageHeader>
      <ScrollArea className="flex-1">
        <div className="mx-auto flex max-w-2xl flex-col gap-6 p-6">
          <p className="text-sm text-muted-foreground">
            {t('code-mode-intro', 'This applies to every member. Off by default.')}
          </p>
          <QueryState query={settings}>
            {({ codeMode }) => <CodeModeSwitch enabled={codeMode} />}
          </QueryState>
          <section className="flex flex-col gap-1">
            <h2 className="text-sm font-medium">
              {t('code-mode-limits', 'What a program can do')}
            </h2>
            <ul className="divide-y">
              <Fact
                icon={IconShieldCheck}
                text={t(
                  'code-mode-fact-api',
                  'Only search and call the API, as the member who asked and within their role.',
                )}
              />
              <Fact
                icon={IconLock}
                text={t(
                  'code-mode-fact-approval',
                  'Changes that need approval are refused inside a program: the assistant asks for them in the chat.',
                )}
              />
              <Fact
                icon={IconClockHour4}
                text={t(
                  'code-mode-fact-time',
                  'It stops after 10 seconds or 50 API calls, and returns at most 20,000 characters.',
                )}
              />
              <Fact
                icon={IconCpu}
                text={t(
                  'code-mode-fact-sandbox',
                  'It runs in an isolated JavaScript sandbox on this server, with 32 MB of memory and no network, files or timers.',
                )}
              />
            </ul>
          </section>
        </div>
      </ScrollArea>
    </PageContainer>
  );
};
