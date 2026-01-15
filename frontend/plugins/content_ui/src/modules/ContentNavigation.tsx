import { IconLibraryPhoto, IconFileText, IconWorld } from '@tabler/icons-react';
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
      <a
        href="https://webbuilder.erxes.io"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
      >
        <IconWorld className="h-4 w-4 text-gray-500" />
        Web Builder
      </a>
    </div>
  );
};
