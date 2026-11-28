import { orpc } from '@erxes/core-contract/client';
import { useQuery } from '@tanstack/react-query';
import { Select } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { paths } from '~/lib/paths';

const ORGANIZATION = 'organization';

/**
 * What an email goes out through: Organization email, or one of the organisation's Mail
 * service connections that are on (SMTP, Amazon SES, SendGrid in Settings › Integrations),
 * from its address. A saved connection turned off since stays shown, marked.
 */
export const MailConnectionSelect = ({
  id,
  value,
  onChange,
  disabled,
}: {
  id?: string;
  value: string | null | undefined;
  onChange: (value: string | null) => void;
  disabled?: boolean;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'mail-connection' });
  const list = useQuery(orpc.emails.mailConnections.queryOptions());
  const connections = list.data?.data ?? [];
  const off = !!value && list.isSuccess && !connections.some((row) => row.id === value);

  return (
    <div className="space-y-1">
      <Select
        value={value ?? ORGANIZATION}
        onValueChange={(next) => onChange(next === ORGANIZATION ? null : next)}
        disabled={Boolean(disabled) || list.isPending}
      >
        <Select.Trigger id={id} aria-invalid={off}>
          <Select.Value />
        </Select.Trigger>
        <Select.Content>
          <Select.Item value={ORGANIZATION}>{t('organization', 'Organization email')}</Select.Item>
          {connections.map((row) => (
            <Select.Item key={row.id} value={row.id}>
              {row.name} · {row.fromEmail}
            </Select.Item>
          ))}
          {off && value && (
            <Select.Item value={value}>{t('off-item', 'A connection that is off')}</Select.Item>
          )}
        </Select.Content>
      </Select>
      <p className="text-xs text-muted-foreground">
        {off
          ? t('off', 'This connection is off or was removed: turn it on, or choose another.')
          : t('hint', 'Connect SMTP, Amazon SES or SendGrid to send from your own account.')}{' '}
        <Link className="underline" to={paths.settings.mailIntegrations}>
          {t('manage', 'Mail service')}
        </Link>
      </p>
    </div>
  );
};
