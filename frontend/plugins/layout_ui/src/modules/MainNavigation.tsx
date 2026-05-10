import { IconFileText, IconLayoutBoard } from '@tabler/icons-react';

import { NavigationMenuLinkItem } from 'erxes-ui';

import { usePages } from '~/modules/builder/hooks/usePages';

const MAX_LINKS = 8;

export const MainNavigation = () => {
  const { pages } = usePages();

  const recent = [...pages]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, MAX_LINKS);

  return (
    <>
      <NavigationMenuLinkItem
        name="All pages"
        path="layout"
        icon={IconLayoutBoard}
      />
      {recent.map((page) => (
        <NavigationMenuLinkItem
          key={page.id}
          name={page.title || 'Untitled'}
          path={`layout/edit/${page.id}`}
          icon={IconFileText}
        />
      ))}
    </>
  );
};
