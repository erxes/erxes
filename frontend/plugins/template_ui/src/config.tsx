import { IconTemplate } from '@tabler/icons-react';
import { Suspense, lazy } from 'react';

const TemplateNavigation = lazy(() =>
  import('./modules/TemplateNavigation').then((module) => ({
    default: module.TemplateNavigation,
  })),
);

export const CONFIG = {
  name: 'template',
  icon: IconTemplate,
  navigationGroup: {
    name: 'template',
    icon: IconTemplate,
    content: () => (
      <Suspense fallback={<div />}>
        <TemplateNavigation />
      </Suspense>
    ),
  },
  modules: [
    {
      name: 'template',
      icon: IconTemplate,
      path: 'template',
      hasSettings: true,
      hasRelationWidget: false,
      hasFloatingWidget: false,
    },
  ],
};
