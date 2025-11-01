import { ChooseIntegrationTypeContent } from '@/integrations/components/ChooseIntegrationType';
import { NavigationMenuGroup } from 'erxes-ui';
import { useLocation } from 'react-router-dom';
import { ChooseChannel } from '@/inbox/channel/components/ChooseChannel';
import { TicketNavigations } from '@/ticket/components/ticket-navigations/TicketNavigations';
export const FrontlineSubGroups = () => {
  const location = useLocation();
  const isInbox = location.pathname.startsWith('/frontline/inbox');
  const isTickets = location.pathname.startsWith('/frontline/tickets');
if (isTickets) {
  return(<TicketNavigations/>)
}
if (!isInbox) return null
  return (
    <>
      <NavigationMenuGroup name="Channels">
        <ChooseChannel />
      </NavigationMenuGroup>
      <NavigationMenuGroup name="Integration types">
        <ChooseIntegrationTypeContent />
      </NavigationMenuGroup>
    </>
  );
};
