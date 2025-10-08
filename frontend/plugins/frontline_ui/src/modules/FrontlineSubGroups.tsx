import { FrontlineActions } from '@/FrontlineActions';
import { ChooseIntegrationTypeContent } from '@/integrations/components/ChooseIntegrationType';
import { NavigationMenuGroup, Sidebar } from 'erxes-ui';
import { useLocation } from 'react-router-dom';
import { ChooseChannel } from '@/inbox/channel/components/ChooseChannel';
export const FrontlineSubGroups = () => {
  const location = useLocation();

  if (!location.pathname.startsWith('/frontline/inbox')) {
    return null;
  }

  return (
    <>
      <FrontlineActions />
      <NavigationMenuGroup name="Integration types">
        <ChooseIntegrationTypeContent />
      </NavigationMenuGroup>
      <Sidebar.Group>
        <Sidebar.GroupLabel asChild>
          <ChooseChannel />
        </Sidebar.GroupLabel>
      </Sidebar.Group>
    </>
  );
};
