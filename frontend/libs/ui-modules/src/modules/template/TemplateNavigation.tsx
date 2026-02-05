import { NavigationMenuLinkItem } from 'erxes-ui';
import { IconTemplate } from '@tabler/icons-react';

export const TemplateNavigation = () => {
  return (
    <NavigationMenuLinkItem
      name="Templates"
      path="template"
      icon={IconTemplate}
    />
  );
};
