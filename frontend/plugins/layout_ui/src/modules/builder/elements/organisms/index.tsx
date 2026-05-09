import {
  IconLayoutBoard,
  IconLayoutGrid,
  IconLayoutNavbarCollapse,
  IconRocket,
} from '@tabler/icons-react';

import { BuilderNode } from '../../types';
import { ElementDef } from '../types';
import { id } from '../../utils/id';

const ContainerDef: ElementDef = {
  type: 'Container',
  kind: 'organism',
  label: 'Container',
  icon: IconLayoutBoard,
  description: 'Page root',
  acceptsChildren: true,
  hidden: true,
  propsSchema: [],
  Component: ({ children }) => (
    <div className="flex flex-col gap-6">{children}</div>
  ),
};

const HeroDef: ElementDef = {
  type: 'Hero',
  kind: 'organism',
  label: 'Hero',
  icon: IconRocket,
  description: 'Big headline + CTA',
  acceptsChildren: false,
  propsSchema: [
    {
      key: 'heading',
      label: 'Heading',
      type: 'string',
      default: 'Headline that converts',
    },
    {
      key: 'subheading',
      label: 'Subheading',
      type: 'text',
      default:
        'A short, friendly explanation of what your product does and who it is for.',
    },
    { key: 'buttonLabel', label: 'Button label', type: 'string', default: 'Get started' },
    { key: 'buttonUrl', label: 'Button URL', type: 'url', default: '#' },
    {
      key: 'imageUrl',
      label: 'Image URL',
      type: 'image',
      default: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=900',
    },
    {
      key: 'align',
      label: 'Align',
      type: 'select',
      default: 'left',
      options: [
        { label: 'Left', value: 'left' },
        { label: 'Center', value: 'center' },
      ],
    },
  ],
  Component: ({ node }) => {
    const align = (node.props.align as string) || 'left';
    const isCenter = align === 'center';
    return (
      <section className="rounded-xl border bg-card p-8 md:p-12">
        <div
          className={`grid gap-8 ${
            isCenter ? 'text-center' : 'md:grid-cols-2 md:items-center'
          }`}
        >
          <div className={`space-y-4 ${isCenter ? 'mx-auto max-w-2xl' : ''}`}>
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              {(node.props.heading as string) || 'Heading'}
            </h1>
            <p className="text-lg text-muted-foreground">
              {(node.props.subheading as string) || ''}
            </p>
            <div className={`flex gap-3 ${isCenter ? 'justify-center' : ''}`}>
              <a
                href={(node.props.buttonUrl as string) || '#'}
                className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-6 text-base font-medium text-primary-foreground hover:bg-primary/90"
              >
                {(node.props.buttonLabel as string) || 'Action'}
              </a>
            </div>
          </div>
          {!isCenter && (node.props.imageUrl as string) && (
            <img
              src={node.props.imageUrl as string}
              alt=""
              className="h-72 w-full rounded-lg object-cover md:h-96"
            />
          )}
        </div>
      </section>
    );
  },
};

const FeaturesGridDef: ElementDef = {
  type: 'FeaturesGrid',
  kind: 'organism',
  label: 'Features grid',
  icon: IconLayoutGrid,
  description: 'Heading + grid of children',
  acceptsChildren: true,
  propsSchema: [
    { key: 'heading', label: 'Heading', type: 'string', default: 'Features' },
    {
      key: 'subheading',
      label: 'Subheading',
      type: 'text',
      default: 'Everything you need, nothing you do not.',
    },
    {
      key: 'columns',
      label: 'Columns',
      type: 'select',
      default: '3',
      options: [
        { label: '2', value: '2' },
        { label: '3', value: '3' },
        { label: '4', value: '4' },
      ],
    },
  ],
  defaultChildren: (): BuilderNode[] => [
    {
      id: id(),
      type: 'FeatureItem',
      kind: 'molecule',
      props: {
        iconName: 'IconBolt',
        heading: 'Fast',
        description: 'Built on Rspack and module federation.',
      },
    },
    {
      id: id(),
      type: 'FeatureItem',
      kind: 'molecule',
      props: {
        iconName: 'IconPuzzle',
        heading: 'Composable',
        description: 'Mix atoms, molecules and organisms.',
      },
    },
    {
      id: id(),
      type: 'FeatureItem',
      kind: 'molecule',
      props: {
        iconName: 'IconShield',
        heading: 'Reliable',
        description: 'Saved instantly, undo any change.',
      },
    },
  ],
  Component: ({ node, children }) => {
    const cols = (node.props.columns as string) || '3';
    const gridClass =
      cols === '2'
        ? 'md:grid-cols-2'
        : cols === '4'
          ? 'md:grid-cols-2 lg:grid-cols-4'
          : 'md:grid-cols-2 lg:grid-cols-3';
    return (
      <section className="space-y-6">
        <div className="space-y-2 text-center">
          <h2 className="text-3xl font-semibold">
            {(node.props.heading as string) || 'Features'}
          </h2>
          {(node.props.subheading as string) ? (
            <p className="text-muted-foreground">
              {node.props.subheading as string}
            </p>
          ) : null}
        </div>
        <div className={`grid grid-cols-1 gap-6 ${gridClass}`}>{children}</div>
      </section>
    );
  },
};

const FooterDef: ElementDef = {
  type: 'Footer',
  kind: 'organism',
  label: 'Footer',
  icon: IconLayoutNavbarCollapse,
  description: 'Footer with nav links',
  acceptsChildren: true,
  propsSchema: [
    {
      key: 'copyright',
      label: 'Copyright',
      type: 'string',
      default: '© 2026 Acme, Inc.',
    },
    {
      key: 'tagline',
      label: 'Tagline',
      type: 'string',
      default: 'Built with the layout module.',
    },
  ],
  defaultChildren: (): BuilderNode[] => [
    {
      id: id(),
      type: 'NavLink',
      kind: 'molecule',
      props: { iconName: 'IconHome', label: 'Home', url: '#' },
    },
    {
      id: id(),
      type: 'NavLink',
      kind: 'molecule',
      props: { iconName: 'IconMail', label: 'Contact', url: '#' },
    },
  ],
  Component: ({ node, children }) => (
    <footer className="rounded-xl border-t bg-muted/40 p-8">
      <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div>
          <div className="text-sm font-semibold">
            {(node.props.tagline as string) || ''}
          </div>
          <div className="text-xs text-muted-foreground">
            {(node.props.copyright as string) || ''}
          </div>
        </div>
        <nav className="flex flex-wrap items-center gap-4">{children}</nav>
      </div>
    </footer>
  ),
};

export const ORGANISM_DEFS: ElementDef[] = [
  ContainerDef,
  HeroDef,
  FeaturesGridDef,
  FooterDef,
];
