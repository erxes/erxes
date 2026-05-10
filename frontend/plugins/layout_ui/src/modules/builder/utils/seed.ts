import { BuilderNode, GridLayoutCell } from '../types';
import { id } from './id';

const containerRoot = (children: BuilderNode[]): BuilderNode => ({
  id: id(),
  type: 'Container',
  kind: 'organism',
  props: {},
  children,
});

const node = (
  type: string,
  kind: BuilderNode['kind'],
  props: Record<string, unknown>,
  layout: GridLayoutCell,
  children?: BuilderNode[],
): BuilderNode => ({
  id: id(),
  type,
  kind,
  props,
  layout,
  children,
});

export const buildEmptyRoot = (): BuilderNode => containerRoot([]);

export const buildHeadingRoot = (): BuilderNode =>
  containerRoot([
    node(
      'Heading',
      'atom',
      { text: 'New page', level: 'h1', align: 'left', color: '' },
      { x: 0, y: 0, w: 12, h: 3 },
    ),
    node(
      'Paragraph',
      'atom',
      {
        text: 'Start writing or drop more components from the palette on the left.',
        align: 'left',
        color: '',
      },
      { x: 0, y: 3, w: 12, h: 4 },
    ),
  ]);

export const buildStatsRoot = (): BuilderNode =>
  containerRoot([
    node(
      'Heading',
      'atom',
      { text: 'At a glance', level: 'h2', align: 'left', color: '' },
      { x: 0, y: 0, w: 12, h: 3 },
    ),
    node(
      'StatCard',
      'molecule',
      {
        value: '12,438',
        label: 'Active users',
        delta: '+12%',
        tone: 'positive',
      },
      { x: 0, y: 3, w: 6, h: 5 },
    ),
    node(
      'StatCard',
      'molecule',
      {
        value: '$48.2k',
        label: 'Revenue',
        delta: '+5.4%',
        tone: 'positive',
      },
      { x: 6, y: 3, w: 6, h: 5 },
    ),
  ]);

export const buildLandingRoot = (): BuilderNode =>
  containerRoot([
    node(
      'Hero',
      'organism',
      {
        heading: 'Build pages without code',
        subheading:
          'Drag, drop and ship in minutes. The layout module gives you a real visual editor backed by atomic components.',
        buttonLabel: 'Get started',
        buttonUrl: '#',
        imageUrl:
          'https://images.unsplash.com/photo-1551434678-e076c223a692?w=900',
        align: 'left',
      },
      { x: 0, y: 0, w: 12, h: 10 },
    ),
    node(
      'FeatureItem',
      'molecule',
      {
        iconName: 'IconBolt',
        heading: 'Fast',
        description: 'Rspack + module federation keeps reloads instant.',
      },
      { x: 0, y: 10, w: 4, h: 6 },
    ),
    node(
      'FeatureItem',
      'molecule',
      {
        iconName: 'IconPuzzle',
        heading: 'Composable',
        description: '15 atoms, 7 molecules, 3 organisms — extend anytime.',
      },
      { x: 4, y: 10, w: 4, h: 6 },
    ),
    node(
      'FeatureItem',
      'molecule',
      {
        iconName: 'IconDeviceLaptop',
        heading: 'Responsive',
        description:
          'Preview desktop, tablet and mobile right inside the editor.',
      },
      { x: 8, y: 10, w: 4, h: 6 },
    ),
    node(
      'Footer',
      'organism',
      { copyright: '© 2026 Acme, Inc.' },
      { x: 0, y: 16, w: 12, h: 5 },
    ),
  ]);
