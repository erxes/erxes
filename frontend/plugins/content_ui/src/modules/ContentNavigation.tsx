import { IconFileText, IconWorldPlus } from '@tabler/icons-react';
import { NavigationMenuLinkItem } from 'erxes-ui';

export const ContentNavigation = () => (
  <>
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
  </>
);
