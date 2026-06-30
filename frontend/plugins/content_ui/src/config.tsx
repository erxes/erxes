import { IconBooks, IconLibraryPhoto } from '@tabler/icons-react';
import { IUIConfig } from 'erxes-ui/types';
import { lazy, Suspense } from 'react';

const ContentNavigation = lazy(() =>
  import('./modules/ContentNavigation').then((module) => ({
    default: module.ContentNavigation,
  })),
);

const getContentFavoriteName = (path: string) => {
  const pathWithoutQuery = path.split('?')[0].replace(/^\/|\/$/g, '');

  if (pathWithoutQuery === 'content/cms') return 'Content / CMS';
  if (pathWithoutQuery === 'content/web-builder') return 'Web Builder';
  if (pathWithoutQuery === 'content/knowledgebase') return 'Knowledge Base';

  if (pathWithoutQuery.endsWith('/posts/add')) return 'CMS / New Post';
  if (pathWithoutQuery.includes('/posts/detail/')) return 'CMS / Post Detail';
  if (pathWithoutQuery.endsWith('/posts')) return 'CMS / Posts';

  if (pathWithoutQuery.includes('/pages/detail')) return 'CMS / Page Detail';
  if (pathWithoutQuery.endsWith('/pages')) return 'CMS / Pages';

  if (pathWithoutQuery.endsWith('/categories')) return 'CMS / Categories';
  if (pathWithoutQuery.endsWith('/tags')) return 'CMS / Tags';
  if (pathWithoutQuery.endsWith('/menus')) return 'CMS / Menus';
  if (pathWithoutQuery.endsWith('/custom-types')) return 'CMS / Custom Types';
  if (pathWithoutQuery.endsWith('/custom-fields')) return 'CMS / Custom Fields';
  if (pathWithoutQuery.endsWith('/cmssettings')) return 'CMS / Settings';

  return 'Content';
};

export const CONFIG: IUIConfig = {
  name: 'content',
  path: 'content',
  navigationGroup: {
    name: 'content',
    icon: IconLibraryPhoto,
    content: () => (
      <Suspense fallback={<div />}>
        <ContentNavigation />
      </Suspense>
    ),
  },
  modules: [
    {
      name: 'cms',
      icon: IconBooks,
      path: 'content/cms',
      favoriteName: getContentFavoriteName,
    },
  ],
};
