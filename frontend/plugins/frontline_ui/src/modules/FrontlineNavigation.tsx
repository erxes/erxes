import { IntegrationNavigation } from '@/integrations/components/IntegrationNavigation';
import { IconMail, IconMessageReply } from '@tabler/icons-react';
import { NavigationMenuLinkItem } from 'erxes-ui';

export const FrontlineNavigation = () => {
  return (
    <>
      <NavigationMenuLinkItem
        name="Inbox"
        icon={IconMail}
        path="frontline/inbox"
      />
      <NavigationMenuLinkItem
        name="Ticket"
        icon={IconMessageReply}
        path="frontline/ticket"
      />
      <IntegrationNavigation />
    </>
  );
};
