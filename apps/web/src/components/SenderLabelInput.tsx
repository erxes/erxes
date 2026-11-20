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

/**
 * The name an email goes out under. SaaS: the organisation's name stays in
 * front and only the label after it is typed (`MSM Group · Marketing`);
 * self-hosted: the whole name. Says which address it goes out from.
 */
export const SenderLabelInput = ({
  id,
  value,
  onChange,
  disabled,
}: {
  id?: string;
  value: string | null | undefined;
  onChange: (value: string) => void;
  disabled?: boolean;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'sender' });
  const providerName = useProviderName();
  const sender = useQuery(orpc.emails.sender.queryOptions());
  const locked = sender.data?.nameLocked;

  return (
    <div className="space-y-1">
      <InputGroup>
        {locked && (
          <InputGroup.Addon>
            <span className="max-w-40 truncate">{`${sender.data?.name ?? ''} ·`}</span>
          </InputGroup.Addon>
        )}
        <InputGroup.Input
          id={id}
          value={value ?? ''}
          maxLength={locked ? 30 : 80}
          disabled={disabled}
          placeholder={locked ? t('label-placeholder', 'Marketing') : sender.data?.name}
          onChange={(event) => onChange(event.target.value)}
        />
      </InputGroup>
      {sender.data && (
        <p className="truncate text-xs text-muted-foreground">
          {t('from-line', '{{name}} <{{address}}> · via {{provider}}', {
            name: fromName(sender.data, value),
            address: sender.data.address,
            provider: providerName(sender.data.provider),
          })}
        </p>
      )}
    </div>
  );
};
