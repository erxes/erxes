import type { EmailSender } from '@erxes/core-contract';
import { orpc } from '@erxes/core-contract/client';
import { useQuery } from '@tanstack/react-query';
import { InputGroup } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useProviderName } from './EmailSetupBanner';

/** The name the email goes out under with this label, as the server builds it (`sender.ts`). */
const fromName = (sender: EmailSender, label: string | null | undefined) => {
  const clean = label?.trim();

  if (!sender.nameLocked) return clean || sender.name;

  return clean && clean.toLowerCase() !== sender.name.toLowerCase()
    ? `${sender.name} · ${clean}`
    : sender.name;
};

/** The line under the name: who the email comes from and what it goes out through. */
const useFromLine = (
  value: string | null | undefined,
  fromEmail: string | null | undefined,
  connectionId: string | null | undefined,
) => {
  const { t } = useTranslation('common', { keyPrefix: 'sender' });
  const providerName = useProviderName();
  const sender = useQuery(orpc.emails.sender.queryOptions());

  const connections = useQuery(
    orpc.emails.mailConnections.queryOptions({ enabled: Boolean(connectionId) }),
  );

  const connection = connectionId
    ? connections.data?.data.find((row) => row.id === connectionId)
    : undefined;

  if (!sender.data) return { sender: undefined, connection, line: null };

  // A Mail service connection: the label, else its name, from its address (`connectionFrom`).
  const line = connection
    ? t('from-line', '{{name}} <{{address}}> · via {{provider}}', {
        name: value?.trim() || connection.fromName || sender.data.name,
        address: connection.fromEmail,
        provider: connection.name,
      })
    : t('from-line', '{{name}} <{{address}}> · via {{provider}}', {
        name: fromName(sender.data, value),
        address: fromEmail || sender.data.address,
        provider: providerName(sender.data.provider),
      });

  return { sender: sender.data, connection, line };
};

/**
 * The name an email goes out under. Through Organization email on SaaS the organisation's name
 * stays in front and only the label after it is typed (`MSM Group · Marketing`); self-hosted,
 * or through a Mail service connection (`connectionId`), the whole name. Says which address it
 * goes out from: the connection's, else `fromEmail` when one is picked, else the settings' own.
 */
export const SenderLabelInput = ({
  id,
  value,
  fromEmail,
  connectionId,
  onChange,
  disabled,
}: {
  id?: string;
  value: string | null | undefined;
  fromEmail?: string | null;
  connectionId?: string | null;
  onChange: (value: string) => void;
  disabled?: boolean;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'sender' });
  const { sender, connection, line } = useFromLine(value, fromEmail, connectionId);
  const locked = sender?.nameLocked && !connection;

  return (
    <div className="space-y-1">
      <InputGroup>
        {locked && (
          <InputGroup.Addon>
            <span className="max-w-40 truncate">{`${sender?.name ?? ''} ·`}</span>
          </InputGroup.Addon>
        )}
        <InputGroup.Input
          id={id}
          value={value ?? ''}
          maxLength={locked ? 30 : 80}
          disabled={disabled}
          placeholder={
            locked ? t('label-placeholder', 'Marketing') : (connection?.fromName ?? sender?.name)
          }
          onChange={(event) => onChange(event.target.value)}
        />
      </InputGroup>
      {line && <p className="truncate text-xs text-muted-foreground">{line}</p>}
    </div>
  );
};
