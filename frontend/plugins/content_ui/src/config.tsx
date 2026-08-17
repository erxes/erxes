import { IconBooks, IconLibraryPhoto, IconSandbox } from '@tabler/icons-react';
import { IUIConfig } from 'erxes-ui/types';
import { lazy, Suspense } from 'react';
import { SEARCH_PROVIDERS } from './searchProviders';

const ContentNavigation = lazy(() =>
  import('./modules/ContentNavigation').then((module) => ({
    default: module.ContentNavigation,
  })),
);

export const CONFIG: IUIConfig = {
  name: 'content',
  path: 'content',
  navigationGroup: {
    name: 'content',
    defaultPath: 'content/cms',
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
    },
    {
      name: 'web-builder',
      icon: IconSandbox,
      path: 'content/web-builder',
    },
  ],
  searchProviders: SEARCH_PROVIDERS,
};
