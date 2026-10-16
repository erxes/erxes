import { IconBooks, IconLibraryPhoto, IconSandbox } from '@tabler/icons-react';
import { IUIConfig } from 'erxes-ui/types';
import { lazy, Suspense } from 'react';

const ContentNavigation = lazy(() =>
  import('@/ContentNavigation').then((module) => ({
    default: module.ContentNavigation,
  })),
);

export const CONFIG: IUIConfig = {
  name: 'content',
  path: 'content',
  plugin: {
    name: 'content',
    color: 'oklch(0.57 0.18 356)',
    description: 'CMS posts and web builder',
    logo: (
      <>
        <rect
          x="16"
          y="9.5"
          width="22"
          height="25"
          rx="3.5"
          fill="#fff"
          opacity=".55"
        />
        <rect x="10" y="14" width="22" height="25" rx="3.5" fill="#fff" />
        <path d="M13.5 35l5.5-6.5 4 4.2 3-3 3.5 5.3z" fill="currentColor" />
        <circle cx="25.5" cy="21.5" r="2.6" fill="currentColor" />
      </>
    ),
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
};
