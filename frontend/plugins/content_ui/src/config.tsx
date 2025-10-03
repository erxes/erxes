import { IconLibraryPhoto } from '@tabler/icons-react';
import { IUIConfig } from 'erxes-ui/types';
import { IconBooks } from '@tabler/icons-react';
import { lazy, Suspense } from 'react';

const ContentNavigation = lazy(() =>
  import('./modules/ContentNavigation').then((module) => ({
    default: module.ContentNavigation,
  })),
);

export const CONFIG: IUIConfig = {
  name: 'content',
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
      name: 'knowledgebase',
      icon: IconBooks,
      path: 'knowledgebase',
      hasSettings: false,
      hasRelationWidget: false,
    },
  ],
};
