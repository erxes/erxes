import { ChooseIntegrationTypeContent } from '@/integrations/components/ChooseIntegrationType';
import { NavigationMenuGroup } from 'erxes-ui';
import { useLocation } from 'react-router-dom';
import { ChooseChannel } from '@/inbox/channel/components/ChooseChannel';
import { CreateChannel } from './channels/components/channels-list/CreateChannel';
export const FrontlineSubGroups = () => {
  const location = useLocation();

  if (!location.pathname.startsWith('/frontline/inbox')) {
    return null;
  }

  return (
    <>
      <NavigationMenuGroup name="Channels" actions={<CreateChannel />}>
        <ChooseChannel />
      </NavigationMenuGroup>
      <NavigationMenuGroup name="Integration types">
        <ChooseIntegrationTypeContent />
      </NavigationMenuGroup>
    </>
  );
};
