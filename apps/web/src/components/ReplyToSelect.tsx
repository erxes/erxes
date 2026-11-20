import { orpc } from '@erxes/core-contract/client';
import { IconX } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { Button, Select } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { paths } from '~/lib/paths';

/**
 * Where replies to an email go: one of the organisation's verified Reply-To
 * addresses (Settings › Integrations › Email sending), or none. A saved
 * address no longer verified stays shown, marked, so the editor sees why
 * sending will refuse it.
 */
export const ReplyToSelect = ({
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
  const { t } = useTranslation('common', { keyPrefix: 'reply-to' });
  const list = useQuery(orpc.emails.replyTos.queryOptions());
  const verified = (list.data ?? []).filter((row) => row.status === 'verified');
  const stale = !!value && list.isSuccess && !verified.some((row) => row.email === value);

  return (
    <div className="space-y-1">
      <div className="flex gap-1">
        <Select
          value={value ?? ''}
          onValueChange={(next) => onChange(next)}
          disabled={Boolean(disabled) || list.isPending}
        >
          <Select.Trigger id={id} aria-invalid={stale}>
            <Select.Value placeholder={t('none', 'To the sender (no Reply-To)')} />
          </Select.Trigger>
          <Select.Content>
            {verified.map((row) => (
              <Select.Item key={row.id} value={row.email}>
                {row.email}
              </Select.Item>
            ))}
            {stale && value && <Select.Item value={value}>{value}</Select.Item>}
          </Select.Content>
        </Select>
        {value && !disabled && (
          <Button
            variant="ghost"
            size="icon"
            aria-label={t('clear', 'No Reply-To')}
            onClick={() => onChange(null)}
          >
            <IconX />
          </Button>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        {stale
          ? t('stale', 'This address isn’t verified any more: choose another or add it again.')
          : t('hint', 'Only confirmed addresses.')}{' '}
        <Link className="underline" to={paths.settings.integration('email')}>
          {t('manage', 'Manage addresses')}
        </Link>
      </p>
    </div>
  );
};
