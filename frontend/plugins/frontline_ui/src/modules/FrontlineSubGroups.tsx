import { FrontlineActions } from '@/FrontlineActions';
import { ChooseIntegrationTypeContent } from '@/integrations/components/ChooseIntegrationType';
import { NavigationMenuGroup } from 'erxes-ui';
import { useLocation } from 'react-router-dom';

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
    </>
  );
};
