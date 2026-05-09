import { BuilderNode, LayoutPage } from '../types';
import { id } from './id';

const containerRoot = (children: BuilderNode[]): BuilderNode => ({
  id: id(),
  type: 'Container',
  kind: 'organism',
  props: {},
  children,
});

const featureItem = (
  iconName: string,
  heading: string,
  description: string,
): BuilderNode => ({
  id: id(),
  type: 'FeatureItem',
  kind: 'molecule',
  props: { iconName, heading, description },
});

const navLink = (label: string, url: string): BuilderNode => ({
  id: id(),
  type: 'NavLink',
  kind: 'molecule',
  props: { iconName: 'IconLink', label, url },
});

export const buildSeedPages = (): LayoutPage[] => {
  const now = new Date().toISOString();

  const landing: LayoutPage = {
    id: id(),
    title: 'Landing demo',
    slug: 'landing-demo',
    status: 'published',
    template: 'landing',
    createdAt: now,
    updatedAt: now,
    root: containerRoot([
      {
        id: id(),
        type: 'Hero',
        kind: 'organism',
        props: {
          heading: 'Build pages without code',
          subheading:
            'Drag, drop and ship in minutes. The layout module gives you a real visual editor backed by atomic components.',
          buttonLabel: 'Get started',
          buttonUrl: '#',
          imageUrl:
            'https://images.unsplash.com/photo-1551434678-e076c223a692?w=900',
          align: 'left',
        },
      },
      {
        id: id(),
        type: 'FeaturesGrid',
        kind: 'organism',
        props: { heading: 'Why teams pick this' },
        children: [
          featureItem(
            'IconBolt',
            'Fast',
            'Rspack + module federation keeps reloads instant.',
          ),
          featureItem(
            'IconPuzzle',
            'Composable',
            '15 atoms, 7 molecules, 3 organisms — extend anytime.',
          ),
          featureItem(
            'IconDeviceLaptop',
            'Responsive',
            'Preview desktop, tablet and mobile right inside the editor.',
          ),
        ],
      },
      {
        id: id(),
        type: 'Footer',
        kind: 'organism',
        props: { copyright: '© 2026 Acme, Inc.' },
        children: [
          navLink('Privacy', '#'),
          navLink('Terms', '#'),
          navLink('Contact', '#'),
        ],
      },
    ]),
  };

  const about: LayoutPage = {
    id: id(),
    title: 'About',
    slug: 'about',
    status: 'draft',
    template: 'blank',
    createdAt: now,
    updatedAt: now,
    root: containerRoot([
      {
        id: id(),
        type: 'Heading',
        kind: 'atom',
        props: {
          text: 'About us',
          level: 'h1',
          align: 'left',
          color: '',
        },
      },
      {
        id: id(),
        type: 'Paragraph',
        kind: 'atom',
        props: {
          text: 'This empty page is yours. Open the editor and start dropping components from the left palette.',
          align: 'left',
          color: '',
        },
      },
    ]),
  };

  return [landing, about];
};

export const buildEmptyRoot = (): BuilderNode => containerRoot([]);

export const buildLandingRoot = (): BuilderNode =>
  buildSeedPages()[0].root;

export const buildHeadingRoot = (): BuilderNode =>
  containerRoot([
    {
      id: id(),
      type: 'Heading',
      kind: 'atom',
      props: { text: 'New page', level: 'h1', align: 'left', color: '' },
    },
    {
      id: id(),
      type: 'Paragraph',
      kind: 'atom',
      props: {
        text: 'Start writing or drop more components from the palette on the left.',
        align: 'left',
        color: '',
      },
    },
  ]);

export const buildStatsRoot = (): BuilderNode =>
  containerRoot([
    {
      id: id(),
      type: 'Heading',
      kind: 'atom',
      props: { text: 'At a glance', level: 'h2', align: 'left', color: '' },
    },
    {
      id: id(),
      type: 'FeaturesGrid',
      kind: 'organism',
      props: {
        heading: 'This quarter',
        subheading: '',
        columns: '2',
      },
      children: [
        {
          id: id(),
          type: 'StatCard',
          kind: 'molecule',
          props: {
            value: '12,438',
            label: 'Active users',
            delta: '+12%',
            tone: 'positive',
          },
        },
        {
          id: id(),
          type: 'StatCard',
          kind: 'molecule',
          props: {
            value: '$48.2k',
            label: 'Revenue',
            delta: '+5.4%',
            tone: 'positive',
          },
        },
      ],
    },
  ]);
