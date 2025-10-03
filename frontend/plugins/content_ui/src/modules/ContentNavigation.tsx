import { IconLibraryPhoto } from '@tabler/icons-react';
import { NavigationMenuLinkItem } from 'erxes-ui';

export const ContentNavigation = () => {
  return (
    <NavigationMenuLinkItem
      icon={IconLibraryPhoto}
      name="Knowledge Base"
      path="content/knowledgebase"
    />
  );
};
