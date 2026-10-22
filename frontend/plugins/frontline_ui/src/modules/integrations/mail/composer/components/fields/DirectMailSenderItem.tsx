import type { DirectMailSenderItemProps } from '@/integrations/mail/composer/types/directMailSender';
import { Select } from 'erxes-ui';

export const DirectMailSenderItem = ({ sender }: DirectMailSenderItemProps) => (
  <Select.Item
    value={sender.integrationId}
    textValue={`${sender.name} ${sender.address}`}
    className="py-2 [&>span:last-child]:min-w-0 [&>span:last-child]:w-full"
  >
    <span className="flex min-w-0 items-baseline gap-1.5">
      <span className="max-w-32 truncate font-medium">{sender.name}</span>
      <span className="truncate text-muted-foreground">
        &lt;{sender.address}&gt;
      </span>
    </span>
  </Select.Item>
);
