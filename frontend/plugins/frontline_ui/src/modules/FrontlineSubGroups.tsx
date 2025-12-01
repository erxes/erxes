import { ChooseChannel } from '@/inbox/channel/components/ChooseChannel';
import { ChooseIntegrationTypeContent } from '@/integrations/components/ChooseIntegrationType';
import { CreateChannel } from '@/channels/components/settings/channels-list/CreateChannel';
import { NavigationMenuGroup } from 'erxes-ui';
import { TicketNavigations } from '@/ticket/components/ticket-navigations/TicketNavigations';
import { useLocation } from 'react-router-dom';
export const FrontlineSubGroups = () => {
  const location = useLocation();
  const isInbox = location.pathname.startsWith('/frontline/inbox');
  const isTickets = location.pathname.startsWith('/frontline/tickets');
  if (isTickets) {
    return <TicketNavigations />;
  }
  if (!isInbox) return null;
  return (
    <>
      <NavigationMenuGroup
        name="Channels"
        actions={<CreateChannel isIconOnly />}
      >
        <ChooseChannel />
      </NavigationMenuGroup>
      <NavigationMenuGroup name="Integration types">
        <ChooseIntegrationTypeContent />
      </NavigationMenuGroup>
    </>
  );
};
