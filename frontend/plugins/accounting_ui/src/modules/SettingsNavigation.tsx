import {
  IconListDetails,
} from '@tabler/icons-react';
import { SettingsNavigationMenuLinkItem, Sidebar } from 'erxes-ui';

export const SettingsNavigation = () => {
  return (
    <Sidebar.Group>
      <Sidebar.GroupLabel className="h-4">Accounting</Sidebar.GroupLabel>
      <Sidebar.GroupContent className='pt-1'>
        <Sidebar.Menu>
          <SettingsNavigationMenuLinkItem name='Accounting' icon={IconListDetails} path="/" pathPrefix="accounting" />
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  );
};
