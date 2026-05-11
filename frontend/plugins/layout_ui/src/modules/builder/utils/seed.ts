import { BuilderNode, Frame } from '../types';
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
  frame: Frame,
  zIndex: number,
  children?: BuilderNode[],
): BuilderNode => ({
  id: id(),
  type,
  kind,
  props,
  frame,
  zIndex,
  children,
});

export const buildEmptyRoot = (): BuilderNode => containerRoot([]);

export const buildHeadingRoot = (): BuilderNode =>
  containerRoot([
    node(
      'Heading',
      'atom',
      { text: 'New page', level: 'h1', align: 'left', color: '' },
      { x: 80, y: 80, w: 800, h: 80 },
      1,
    ),
    node(
      'Paragraph',
      'atom',
      {
        text: 'Drag from the palette, then move and resize freely. Hold Shift to multi-select.',
        align: 'left',
        color: '',
      },
      { x: 80, y: 180, w: 800, h: 80 },
      2,
    ),
  ]);

export const buildStatsRoot = (): BuilderNode =>
  containerRoot([
    node(
      'Heading',
      'atom',
      { text: 'At a glance', level: 'h2', align: 'left', color: '' },
      { x: 80, y: 80, w: 800, h: 60 },
      1,
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
      { x: 80, y: 160, w: 380, h: 160 },
      2,
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
      { x: 500, y: 160, w: 380, h: 160 },
      3,
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
      { x: 60, y: 60, w: 1320, h: 420 },
      1,
    ),
    node(
      'FeatureItem',
      'molecule',
      {
        iconName: 'IconBolt',
        heading: 'Fast',
        description: 'Rspack + module federation keeps reloads instant.',
      },
      { x: 60, y: 520, w: 420, h: 220 },
      2,
    ),
    node(
      'FeatureItem',
      'molecule',
      {
        iconName: 'IconPuzzle',
        heading: 'Composable',
        description: '15 atoms, 7 molecules, 3 organisms — extend anytime.',
      },
      { x: 510, y: 520, w: 420, h: 220 },
      3,
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
      { x: 960, y: 520, w: 420, h: 220 },
      4,
    ),
    node(
      'Footer',
      'organism',
      { copyright: '© 2026 Acme, Inc.' },
      { x: 60, y: 780, w: 1320, h: 120 },
      5,
    ),
  ]);
