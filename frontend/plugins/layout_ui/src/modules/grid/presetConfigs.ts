import { LayoutConfig } from './types';

export const dashboardPreset: LayoutConfig = {
  cols: 12,
  rowHeight: 60,
  items: [
    {
      i: 'stats',
      x: 0,
      y: 0,
      w: 12,
      h: 3,
      component: 'statGroup',
      props: {
        columns: 3,
        stats: [
          { label: 'Active layouts', value: 4, hint: '+1 this week' },
          { label: 'Components', value: 11, hint: 'atoms + molecules + organisms' },
          { label: 'Grid columns', value: 12, hint: 'responsive: 12/6/4/2' },
        ],
      },
    },
    {
      i: 'overview',
      x: 0,
      y: 3,
      w: 8,
      h: 5,
      component: 'contentSection',
      props: {
        title: 'Overview',
        description:
          'Drag any tile to rearrange. Resize from the bottom-right corner. The new positions emit through onChange.',
      },
    },
    {
      i: 'breadcrumb',
      x: 8,
      y: 3,
      w: 4,
      h: 2,
      component: 'breadcrumbBar',
      props: {
        items: [
          { label: 'Layout', to: '/layout' },
          { label: 'Dashboards', to: '/layout/dashboards/demo' },
          { label: 'Demo' },
        ],
      },
    },
    {
      i: 'meta',
      x: 8,
      y: 5,
      w: 4,
      h: 3,
      component: 'contentSection',
      props: {
        title: 'Meta',
        description: 'Layout type: dashboard',
      },
    },
  ],
};

export const samplePagePreset: LayoutConfig = {
  cols: 12,
  rowHeight: 60,
  items: [
    {
      i: 'title',
      x: 0,
      y: 0,
      w: 12,
      h: 1,
      static: true,
      component: 'heading',
      props: { level: 2, children: 'Sample static page' },
    },
    {
      i: 'intro',
      x: 0,
      y: 1,
      w: 12,
      h: 2,
      static: true,
      component: 'text',
      props: {
        variant: 'muted',
        children:
          'This page is rendered from a LayoutConfig but with drag and resize disabled.',
      },
    },
    {
      i: 'main',
      x: 0,
      y: 3,
      w: 8,
      h: 5,
      static: true,
      component: 'contentSection',
      props: {
        title: 'Main content',
        description: 'Composed entirely from registered components.',
      },
    },
    {
      i: 'aside',
      x: 8,
      y: 3,
      w: 4,
      h: 5,
      static: true,
      component: 'statCard',
      props: { label: 'Read-only mode', value: 'static', hint: 'no drag handles' },
    },
  ],
};
