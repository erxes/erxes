import { IconFileText, IconWorldPlus } from '@tabler/icons-react';
import { NavigationMenuLinkItem } from 'erxes-ui';

export const ContentNavigation = () => {
  return (
    <div>
      {/* <NavigationMenuLinkItem
        name="Knowledge Base"
        path="/content/knowledgebase"
        icon={IconLibraryPhoto}
      /> */}
      <NavigationMenuLinkItem
        name="CMS"
        path="/content/cms"
        icon={IconFileText}
      />
      <NavigationMenuLinkItem
        name="Web Builder"
        path="/content/web-builder"
        icon={IconWorldPlus}
      />
    </div>
  );
};
