import { ChannelScope } from '@/channels/types';
import { DirectMailSenderItem } from '@/integrations/mail/composer/components/fields/DirectMailSenderItem';
import type { DirectMailSenderGroupProps } from '@/integrations/mail/composer/types/directMailSender';
import { Select } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const DirectMailSenderGroup = ({
  scope,
  senders,
}: DirectMailSenderGroupProps) => {
  const { t } = useTranslation('frontline');
  if (!senders.length) return null;
  const label =
    scope === ChannelScope.PERSONAL
      ? t('personal-inbox', 'Personal inbox')
      : t('team-inbox', 'Team inbox');
  return (
    <Select.Group className="py-1 [&:not(:first-child)]:border-t [&:not(:first-child)]:border-border">
      <Select.Label className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
        {label}
      </Select.Label>
      {senders.map((sender) => (
        <DirectMailSenderItem key={sender.integrationId} sender={sender} />
      ))}
    </Select.Group>
  );
};
