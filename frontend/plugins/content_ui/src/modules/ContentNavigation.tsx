import { IconLibraryPhoto, IconFileText } from '@tabler/icons-react';
import { NavigationMenuLinkItem } from 'erxes-ui';

export const ContentNavigation = () => {
  return (
    <div>
      <NavigationMenuLinkItem
        name="Knowledge Base"
        path="/content/knowledgebase"
        icon={IconLibraryPhoto}
      />
      <NavigationMenuLinkItem
        name="Cms"
        path="/content/cms"
        icon={IconFileText}
      />
    </div>
  );
};
