import { IconCode, IconPencil, IconPlug, IconSearch, type TablerIcon } from '@tabler/icons-react';
import { AppBreadcrumb, PageContainer, PageHeader, ScrollArea } from 'erxes-ui';
import type { ReactNode } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { CopyField } from '~/components/CopyField';
import { paths } from '~/lib/paths';

const Client = ({
  name,
  value,
  label,
  hint,
}: {
  name: string;
  value: string;
  label: string;
  hint: ReactNode;
}) => (
  <li className="flex flex-col gap-2 py-4">
    <h3 className="text-sm font-medium">{name}</h3>
    <CopyField value={value} label={label} />
    <p className="text-sm text-muted-foreground">{hint}</p>
  </li>
);

/** How each kind of client connects: a command, or the address to paste. */
const Clients = ({ url }: { url: string }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'mcp' });
  const command = t('command', 'Command');

  return (
    <section className="flex flex-col">
      <h2 className="text-sm font-medium">{t('connect', 'Connect a client')}</h2>
      <ul className="divide-y">
        <Client
          name="Claude Code"
          value={`claude mcp add --transport http erxes ${url}`}
          label={command}
          hint={t('claude-code-hint', 'Then run /mcp in Claude Code and sign in.')}
        />
        <Client
          name="Codex"
          value={`codex mcp add erxes --url ${url}`}
          label={command}
          hint={t('codex-hint', 'Then run codex mcp login erxes and sign in.')}
        />
        <Client
          name={t('apps', 'Claude, ChatGPT and other apps')}
          value={url}
          label={t('address', 'Server address')}
          hint={t(
            'apps-hint',
            'Add a custom connector with this address, then sign in when the app asks.',
          )}
        />
        <Client
          name={t('key', 'With an API key')}
          value={`claude mcp add --transport http erxes ${url} --header "Authorization: Bearer <key>"`}
          label={command}
          hint={
            <Trans
              t={t}
              i18nKey="key-hint"
              defaults="For scripts and agents that run unattended: no sign-in, and the key's rules limit what they do. Make one under <keys>API keys</keys>."
              components={{ keys: <Link to={paths.settings.apiKeys} className="underline" /> }}
            />
          }
        />
      </ul>
    </section>
  );
};

const Tool = ({ icon: Icon, text }: { icon: TablerIcon; text: ReactNode }) => (
  <li className="flex items-start gap-3 py-2">
    <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
    <span className="text-sm">{text}</span>
  </li>
);

/** The server's tools: read freely, write with approval, run programs in code mode. */
const Tools = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'mcp' });

  return (
    <section className="flex flex-col gap-1">
      <h2 className="text-sm font-medium">{t('tools', 'What a client can do')}</h2>
      <ul className="divide-y">
        <Tool
          icon={IconSearch}
          text={t(
            'tool-read',
            "Search every endpoint of erxes and its installed plugins, and read through any of them. Reading changes nothing, so apps don't ask first.",
          )}
        />
        <Tool
          icon={IconPencil}
          text={t(
            'tool-write',
            'Create, change and delete through a separate tool, which apps ask you to approve.',
          )}
        />
        <Tool
          icon={IconCode}
          text={
            <Trans
              t={t}
              i18nKey="tool-execute"
              defaults="Run a short program that reads through the API and computes totals, when <codeMode>code mode</codeMode> is on. A program can't change anything."
              components={{
                codeMode: <Link to={paths.settings.assistantCodeMode} className="underline" />,
              }}
            />
          }
        />
      </ul>
    </section>
  );
};

/**
 * Settings › MCP server: the address and the command or steps that connect Claude, ChatGPT,
 * Codex or another MCP client to it, and what the client can do there as the member.
 */
export const McpPage = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'mcp' });
  // core's MCP server, on the address the member reaches this page at.
  const url = `${window.location.origin}/core/v1/mcp`;

  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <AppBreadcrumb
            items={[{ label: t('title', 'MCP server'), to: paths.settings.mcp, icon: IconPlug }]}
          />
        </PageHeader.Start>
      </PageHeader>
      <ScrollArea className="flex-1">
        <div className="mx-auto flex max-w-2xl flex-col gap-6 p-6">
          <section className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">
              {t(
                'intro',
                'Connect an AI app or coding agent to erxes. It signs in as you, so it sees and changes only what your role allows, and the audit log records its changes as made through MCP.',
              )}
            </p>
            <CopyField value={url} label={t('address', 'Server address')} />
          </section>
          <Clients url={url} />
          <Tools />
        </div>
      </ScrollArea>
    </PageContainer>
  );
};
