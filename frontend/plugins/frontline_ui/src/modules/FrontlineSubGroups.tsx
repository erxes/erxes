import { FrontlineActions } from '@/FrontlineActions';
import { ChooseIntegrationTypeContent } from '@/integrations/components/ChooseIntegrationType';
import { NavigationMenuGroup, Sidebar } from 'erxes-ui';
import { useLocation } from 'react-router-dom';
import { ChooseChannel } from '@/inbox/channel/components/ChooseChannel';
import { TicketNavigations } from '@/ticket/components/ticket-navigations/TicketNavigations';
export const FrontlineSubGroups = () => {
  const location = useLocation();
  const isInbox = location.pathname.startsWith('/frontline/inbox');
  const isTicket = location.pathname.startsWith('/frontline/tickets');

  return (
    <>
      <Sidebar.Group>
        <Sidebar.GroupLabel asChild>
          {/* {isInbox && <ChooseChannel />} */}
        </Sidebar.GroupLabel>
      </Sidebar.Group>
      {isTicket && <TicketNavigations />}
      <FrontlineActions />
      <NavigationMenuGroup name="Integration types">
        <ChooseIntegrationTypeContent />
      </NavigationMenuGroup>
    </>
  );
};
