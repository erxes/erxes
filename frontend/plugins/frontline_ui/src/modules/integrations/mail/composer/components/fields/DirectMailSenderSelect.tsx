import { ChannelScope } from '@/channels/types';
import { DirectMailSenderGroup } from '@/integrations/mail/composer/components/fields/DirectMailSenderGroup';
import { useDirectMailComposerContext } from '@/integrations/mail/composer/hooks/useDirectMailComposerFields';
import type { DirectMailSenderSelectProps } from '@/integrations/mail/composer/types/directMailSender';
import { Select } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const DirectMailSenderSelect = ({
  value,
  onValueChange,
  onBlur,
  invalid,
  hasError,
}: DirectMailSenderSelectProps) => {
  const { selectedSender, senders, sending, failedDelivery } =
    useDirectMailComposerContext();
  const { t } = useTranslation('frontline');
  return (
    <Select
      value={value}
      onValueChange={onValueChange}
      disabled={sending || Boolean(failedDelivery)}
    >
      <Select.Trigger
        id="direct-mail-sender"
        aria-label={t('mail-from')}
        aria-invalid={invalid}
        aria-describedby={hasError ? 'direct-mail-sender-error' : undefined}
        onBlur={onBlur}
        className="h-9 min-w-0 border-0 px-0 shadow-none focus:shadow-none"
      >
        <Select.Value placeholder={t('mail-select-sender')}>
          {selectedSender &&
            `${selectedSender.name} <${selectedSender.address}>`}
        </Select.Value>
      </Select.Trigger>
      <Select.Content className="border border-border">
        <DirectMailSenderGroup
          scope={ChannelScope.PERSONAL}
          senders={senders.filter(
            (sender) => sender.channelScope === ChannelScope.PERSONAL,
          )}
        />
        <DirectMailSenderGroup
          scope={ChannelScope.TEAM}
          senders={senders.filter(
            (sender) => sender.channelScope !== ChannelScope.PERSONAL,
          )}
        />
      </Select.Content>
    </Select>
  );
};
