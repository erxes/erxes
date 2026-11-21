import { orpc } from '@erxes/core-contract/client';
import { useQuery } from '@tanstack/react-query';
import { Select } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { paths } from '~/lib/paths';
import { useCan } from '~/modules/auth/session';

/** The organisation's sending address: no sender chosen. */
const DEFAULT = 'default';

/**
 * Who an email goes out as: the sending address, or one of the confirmed
 * senders (Settings › Email sending › Senders).
 */
export const SenderSelect = ({
  id,
  label,
  value,
  onChange,
  disabled,
}: {
  id?: string;
  /** Its name when no `<label htmlFor={id}>` names it. */
  label?: string;
  value: string | null;
  /** A confirmed sender's address; null: the sending address. */
  onChange: (email: string | null) => void;
  disabled?: boolean;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'sender-select' });
  const senders = useQuery(orpc.emails.senders.queryOptions());
  // Only members who manage integrations can open the Senders tab.
  const canManage = useCan()('integrations.manage');
  const confirmed = (senders.data?.data ?? []).filter((sender) => sender.confirmedAt);
  const known = !value || confirmed.some((sender) => sender.email === value);

  return (
    <div className="space-y-1.5">
      <Select
        value={value ?? DEFAULT}
        disabled={disabled}
        onValueChange={(next) => onChange(next === DEFAULT ? null : next)}
      >
        <Select.Trigger id={id} aria-label={label}>
          <Select.Value />
        </Select.Trigger>
        <Select.Content>
          <Select.Item value={DEFAULT}>{t('default', 'Your sending address')}</Select.Item>
          {!known && value && (
            <Select.Item value={value}>
              {t('unconfirmed', '{{email}} (not confirmed)', { email: value })}
            </Select.Item>
          )}
          {confirmed.map((sender) => (
            <Select.Item key={sender.id} value={sender.email}>
              {sender.name} &lt;{sender.email}&gt;
            </Select.Item>
          ))}
        </Select.Content>
      </Select>
      <p className="text-xs text-muted-foreground">
        {senders.isError
          ? t('failed', 'Could not load the senders.')
          : t('hint', 'Only confirmed senders are listed.')}
        {canManage && (
          <>
            {' '}
            <Link to={paths.settings.emailSenders} className="text-primary-text underline">
              {t('manage', 'Manage senders')}
            </Link>
          </>
        )}
      </p>
    </div>
  );
};
