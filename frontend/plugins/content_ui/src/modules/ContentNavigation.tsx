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
      <div
        onClick={() =>
          window.open(
            'https://example.webbuilder.app.erxes.io',
            '_blank',
            'noopener,noreferrer',
          )
        }
      >
        <NavigationMenuLinkItem
          name="Web Builder"
          path="#"
          icon={IconWorldPlus}
        />
      </div>
    </div>
  );
};
