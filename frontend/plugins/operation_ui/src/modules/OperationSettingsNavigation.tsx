import { OperationPaths } from '~/types/paths';
import { SettingsNavigationMenuLinkItem, Sidebar } from 'erxes-ui';

export const OperationSettingsNavigation = () => {
  return (
    <Sidebar.Group>
      <Sidebar.GroupLabel className="h-4">Operation</Sidebar.GroupLabel>
      <Sidebar.GroupContent className="pt-1">
        <Sidebar.Menu>
          <SettingsNavigationMenuLinkItem
            pathPrefix={OperationPaths.Operation}
            path={OperationPaths.TeamList}
            name="Teams"
          />
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  );
};
