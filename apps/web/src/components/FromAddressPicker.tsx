import { IconX } from '@tabler/icons-react';
import { Button, Input, Select } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { EmailAlert, useProviderName } from './EmailSetupBanner';
import type { FromAddress } from './useFromAddress';

/**
 * The From address: a local part on a domain the provider verified; empty, the settings' own
 * address. A saved address whose domain isn't verified any more stays, with an alert to fix it.
 */
export const FromAddressPicker = ({
  id,
  from,
  disabled,
}: {
  id?: string;
  from: FromAddress;
  disabled?: boolean;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'sender' });
  const providerName = useProviderName();

  return (
    <div className="space-y-1.5">
      <div className="flex gap-1">
        <Input
          id={id}
          value={from.local}
          placeholder={from.placeholder}
          aria-invalid={from.stale}
          disabled={disabled}
          className="min-w-0 flex-1"
          onChange={(event) => from.setLocal(event.target.value)}
        />
        <Select value={from.domain} onValueChange={from.setDomain} disabled={disabled}>
          <Select.Trigger aria-label={t('domain', 'Domain')} className="w-auto max-w-48">
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            {from.options.map((domain) => (
              <Select.Item key={domain} value={domain}>{`@${domain}`}</Select.Item>
            ))}
          </Select.Content>
        </Select>
        {from.local && !disabled && (
          <Button
            variant="ghost"
            size="icon"
            aria-label={t('from-default', 'Send from the default address')}
            onClick={from.clear}
          >
            <IconX />
          </Button>
        )}
      </div>
      {from.stale && (
        <EmailAlert
          title={t('from-stale-title', '{{domain}} isn’t verified any more', {
            domain: from.domain,
          })}
          description={t(
            'from-stale',
            '{{provider}} no longer sends from this domain, so this email won’t go out. Verify the domain there and check again in Settings, or choose another one.',
            { provider: from.provider ? providerName(from.provider) : '' },
          )}
        />
      )}
    </div>
  );
};
