import {
  IconAlignLeft,
  IconBlockquote,
  IconCircleDot,
  IconCursorText,
  IconHeading,
  IconLetterA,
  IconLink,
  IconList,
  IconMinus,
  IconMoodSmile,
  IconPhoto,
  IconRectangle,
  IconSpace,
  IconUserCircle,
  IconVideo,
} from '@tabler/icons-react';

import { ElementDef } from '../types';
import { ICON_OPTIONS, renderIcon } from '../iconMap';

const alignClass = (align: unknown) =>
  align === 'center'
    ? 'text-center'
    : align === 'right'
      ? 'text-right'
      : 'text-left';

const HeadingDef: ElementDef = {
  type: 'Heading',
  kind: 'atom',
  label: 'Heading',
  icon: IconHeading,
  description: 'h1 – h6 text',
  propsSchema: [
    { key: 'text', label: 'Text', type: 'string', default: 'Heading' },
    {
      key: 'level',
      label: 'Level',
      type: 'select',
      default: 'h2',
      options: [
        { label: 'H1', value: 'h1' },
        { label: 'H2', value: 'h2' },
        { label: 'H3', value: 'h3' },
        { label: 'H4', value: 'h4' },
        { label: 'H5', value: 'h5' },
        { label: 'H6', value: 'h6' },
      ],
    },
    {
      key: 'align',
      label: 'Align',
      type: 'select',
      default: 'left',
      options: [
        { label: 'Left', value: 'left' },
        { label: 'Center', value: 'center' },
        { label: 'Right', value: 'right' },
      ],
    },
    { key: 'color', label: 'Color', type: 'color', default: '' },
  ],
  Component: ({ node }) => {
    const level = (node.props.level as string) || 'h2';
    const text = (node.props.text as string) || 'Heading';
    const color = (node.props.color as string) || undefined;
    const sizeClass =
      level === 'h1'
        ? 'text-4xl font-bold'
        : level === 'h2'
          ? 'text-3xl font-semibold'
          : level === 'h3'
            ? 'text-2xl font-semibold'
            : level === 'h4'
              ? 'text-xl font-medium'
              : level === 'h5'
                ? 'text-lg font-medium'
                : 'text-base font-medium';
    const className = `${sizeClass} ${alignClass(node.props.align)}`;
    const style = color ? { color } : undefined;
    switch (level) {
      case 'h1':
        return <h1 className={className} style={style}>{text}</h1>;
      case 'h3':
        return <h3 className={className} style={style}>{text}</h3>;
      case 'h4':
        return <h4 className={className} style={style}>{text}</h4>;
      case 'h5':
        return <h5 className={className} style={style}>{text}</h5>;
      case 'h6':
        return <h6 className={className} style={style}>{text}</h6>;
      default:
        return <h2 className={className} style={style}>{text}</h2>;
    }
  },
};

const ParagraphDef: ElementDef = {
  type: 'Paragraph',
  kind: 'atom',
  label: 'Paragraph',
  icon: IconAlignLeft,
  description: 'Body text',
  propsSchema: [
    {
      key: 'text',
      label: 'Text',
      type: 'text',
      default:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt.',
    },
    {
      key: 'align',
      label: 'Align',
      type: 'select',
      default: 'left',
      options: [
        { label: 'Left', value: 'left' },
        { label: 'Center', value: 'center' },
        { label: 'Right', value: 'right' },
      ],
    },
    { key: 'color', label: 'Color', type: 'color', default: '' },
  ],
  Component: ({ node }) => {
    const color = (node.props.color as string) || undefined;
    return (
      <p
        className={`text-base leading-relaxed text-muted-foreground ${alignClass(
          node.props.align,
        )}`}
        style={color ? { color } : undefined}
      >
        {(node.props.text as string) || ''}
      </p>
    );
  },
};

const ButtonDef: ElementDef = {
  type: 'Button',
  kind: 'atom',
  label: 'Button',
  icon: IconRectangle,
  description: 'Call-to-action button',
  propsSchema: [
    { key: 'label', label: 'Label', type: 'string', default: 'Click me' },
    { key: 'url', label: 'URL', type: 'url', default: '#' },
    {
      key: 'variant',
      label: 'Variant',
      type: 'select',
      default: 'primary',
      options: [
        { label: 'Primary', value: 'primary' },
        { label: 'Secondary', value: 'secondary' },
        { label: 'Ghost', value: 'ghost' },
      ],
    },
    {
      key: 'size',
      label: 'Size',
      type: 'select',
      default: 'md',
      options: [
        { label: 'Small', value: 'sm' },
        { label: 'Medium', value: 'md' },
        { label: 'Large', value: 'lg' },
      ],
    },
  ],
  Component: ({ node }) => {
    const variant = (node.props.variant as string) || 'primary';
    const size = (node.props.size as string) || 'md';
    const variantClass =
      variant === 'secondary'
        ? 'bg-muted text-foreground hover:bg-muted/80'
        : variant === 'ghost'
          ? 'bg-transparent text-foreground hover:bg-muted'
          : 'bg-primary text-primary-foreground hover:bg-primary/90';
    const sizeClass =
      size === 'sm'
        ? 'h-8 px-3 text-sm'
        : size === 'lg'
          ? 'h-12 px-6 text-lg'
          : 'h-10 px-4 text-base';
    return (
      <a
        href={(node.props.url as string) || '#'}
        className={`inline-flex items-center justify-center rounded-md font-medium transition ${variantClass} ${sizeClass}`}
      >
        {(node.props.label as string) || 'Button'}
      </a>
    );
  },
};

const ImageDef: ElementDef = {
  type: 'Image',
  kind: 'atom',
  label: 'Image',
  icon: IconPhoto,
  description: 'Single image',
  propsSchema: [
    {
      key: 'src',
      label: 'Source URL',
      type: 'image',
      default: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800',
    },
    { key: 'alt', label: 'Alt text', type: 'string', default: '' },
    {
      key: 'fit',
      label: 'Fit',
      type: 'select',
      default: 'cover',
      options: [
        { label: 'Cover', value: 'cover' },
        { label: 'Contain', value: 'contain' },
      ],
    },
    {
      key: 'height',
      label: 'Height (px)',
      type: 'number',
      default: 240,
      min: 60,
      max: 1200,
    },
  ],
  Component: ({ node }) => (
    <img
      src={(node.props.src as string) || ''}
      alt={(node.props.alt as string) || ''}
      className="w-full rounded-md"
      style={{
        height: `${(node.props.height as number) || 240}px`,
        objectFit: (node.props.fit as 'cover' | 'contain') || 'cover',
      }}
    />
  ),
};

const LinkDef: ElementDef = {
  type: 'Link',
  kind: 'atom',
  label: 'Link',
  icon: IconLink,
  description: 'Inline anchor',
  propsSchema: [
    { key: 'label', label: 'Label', type: 'string', default: 'Read more' },
    { key: 'url', label: 'URL', type: 'url', default: '#' },
    {
      key: 'target',
      label: 'Open in',
      type: 'select',
      default: '_self',
      options: [
        { label: 'Same tab', value: '_self' },
        { label: 'New tab', value: '_blank' },
      ],
    },
  ],
  Component: ({ node }) => (
    <a
      href={(node.props.url as string) || '#'}
      target={(node.props.target as string) || '_self'}
      rel={node.props.target === '_blank' ? 'noopener noreferrer' : undefined}
      className="text-primary underline-offset-4 hover:underline"
    >
      {(node.props.label as string) || 'link'}
    </a>
  ),
};

const IconDef: ElementDef = {
  type: 'Icon',
  kind: 'atom',
  label: 'Icon',
  icon: IconMoodSmile,
  description: 'Tabler icon',
  propsSchema: [
    {
      key: 'name',
      label: 'Icon',
      type: 'select',
      options: ICON_OPTIONS,
      default: 'IconStar',
    },
    { key: 'size', label: 'Size', type: 'number', default: 32, min: 12, max: 128 },
    { key: 'color', label: 'Color', type: 'color', default: '' },
  ],
  Component: ({ node }) =>
    renderIcon(node.props.name as string, {
      size: (node.props.size as number) || 32,
      color: (node.props.color as string) || undefined,
    }),
};

const DividerDef: ElementDef = {
  type: 'Divider',
  kind: 'atom',
  label: 'Divider',
  icon: IconMinus,
  description: 'Horizontal separator',
  propsSchema: [
    { key: 'thickness', label: 'Thickness', type: 'number', default: 1, min: 1, max: 12 },
    { key: 'color', label: 'Color', type: 'color', default: '#e5e7eb' },
  ],
  Component: ({ node }) => (
    <hr
      style={{
        borderTopWidth: `${(node.props.thickness as number) || 1}px`,
        borderTopColor: (node.props.color as string) || '#e5e7eb',
        borderTopStyle: 'solid',
        margin: '12px 0',
        width: '100%',
      }}
    />
  ),
};

const SpacerDef: ElementDef = {
  type: 'Spacer',
  kind: 'atom',
  label: 'Spacer',
  icon: IconSpace,
  description: 'Vertical breathing room',
  propsSchema: [
    { key: 'height', label: 'Height (px)', type: 'number', default: 32, min: 4, max: 400 },
  ],
  Component: ({ node }) => (
    <div style={{ height: `${(node.props.height as number) || 32}px` }} />
  ),
};

const BadgeDef: ElementDef = {
  type: 'Badge',
  kind: 'atom',
  label: 'Badge',
  icon: IconCircleDot,
  description: 'Small status pill',
  propsSchema: [
    { key: 'label', label: 'Label', type: 'string', default: 'New' },
    {
      key: 'tone',
      label: 'Tone',
      type: 'select',
      default: 'primary',
      options: [
        { label: 'Primary', value: 'primary' },
        { label: 'Success', value: 'success' },
        { label: 'Warning', value: 'warning' },
        { label: 'Danger', value: 'danger' },
        { label: 'Neutral', value: 'neutral' },
      ],
    },
  ],
  Component: ({ node }) => {
    const tone = (node.props.tone as string) || 'primary';
    const tones: Record<string, string> = {
      primary: 'bg-primary/10 text-primary',
      success: 'bg-emerald-100 text-emerald-700',
      warning: 'bg-amber-100 text-amber-700',
      danger: 'bg-red-100 text-red-700',
      neutral: 'bg-muted text-muted-foreground',
    };
    return (
      <span
        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${tones[tone] || tones.primary}`}
      >
        {(node.props.label as string) || 'Badge'}
      </span>
    );
  },
};

const QuoteDef: ElementDef = {
  type: 'Quote',
  kind: 'atom',
  label: 'Quote',
  icon: IconBlockquote,
  description: 'Pull quote',
  propsSchema: [
    {
      key: 'text',
      label: 'Quote text',
      type: 'text',
      default: 'Great products are built by great teams using great tools.',
    },
    { key: 'author', label: 'Author', type: 'string', default: 'Anonymous' },
  ],
  Component: ({ node }) => (
    <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground">
      <p className="mb-2">"{(node.props.text as string) || ''}"</p>
      <footer className="text-sm not-italic text-foreground">
        — {(node.props.author as string) || ''}
      </footer>
    </blockquote>
  ),
};

const BulletListDef: ElementDef = {
  type: 'BulletList',
  kind: 'atom',
  label: 'Bullet list',
  icon: IconList,
  description: 'Unordered list',
  propsSchema: [
    {
      key: 'items',
      label: 'Items (one per line)',
      type: 'text',
      default: 'First item\nSecond item\nThird item',
    },
  ],
  Component: ({ node }) => {
    const raw = (node.props.items as string) || '';
    const items = raw.split('\n').map((s) => s.trim()).filter(Boolean);
    return (
      <ul className="list-disc space-y-1 pl-6">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    );
  },
};

const VideoDef: ElementDef = {
  type: 'Video',
  kind: 'atom',
  label: 'Video',
  icon: IconVideo,
  description: 'Embed (YouTube/Vimeo)',
  propsSchema: [
    {
      key: 'url',
      label: 'Embed URL',
      type: 'url',
      default: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    },
    {
      key: 'aspect',
      label: 'Aspect',
      type: 'select',
      default: '16/9',
      options: [
        { label: '16:9', value: '16/9' },
        { label: '4:3', value: '4/3' },
        { label: '1:1', value: '1/1' },
      ],
    },
  ],
  Component: ({ node }) => (
    <div
      className="w-full overflow-hidden rounded-md bg-black"
      style={{ aspectRatio: (node.props.aspect as string) || '16/9' }}
    >
      <iframe
        src={(node.props.url as string) || ''}
        title="video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="h-full w-full"
      />
    </div>
  ),
};

const AvatarDef: ElementDef = {
  type: 'Avatar',
  kind: 'atom',
  label: 'Avatar',
  icon: IconUserCircle,
  description: 'Round profile image',
  propsSchema: [
    {
      key: 'src',
      label: 'Image URL',
      type: 'image',
      default:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160',
    },
    { key: 'alt', label: 'Alt text', type: 'string', default: 'Avatar' },
    { key: 'size', label: 'Size (px)', type: 'number', default: 56, min: 24, max: 240 },
  ],
  Component: ({ node }) => {
    const size = (node.props.size as number) || 56;
    return (
      <img
        src={(node.props.src as string) || ''}
        alt={(node.props.alt as string) || ''}
        className="rounded-full object-cover"
        style={{ width: `${size}px`, height: `${size}px` }}
      />
    );
  },
};

const InputFieldDef: ElementDef = {
  type: 'InputField',
  kind: 'atom',
  label: 'Input field',
  icon: IconCursorText,
  description: 'Form input (visual only)',
  propsSchema: [
    { key: 'label', label: 'Label', type: 'string', default: 'Email' },
    {
      key: 'placeholder',
      label: 'Placeholder',
      type: 'string',
      default: 'name@example.com',
    },
    {
      key: 'type',
      label: 'Type',
      type: 'select',
      default: 'text',
      options: [
        { label: 'Text', value: 'text' },
        { label: 'Email', value: 'email' },
        { label: 'Password', value: 'password' },
        { label: 'Number', value: 'number' },
        { label: 'Tel', value: 'tel' },
      ],
    },
  ],
  Component: ({ node }) => (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium">
        {(node.props.label as string) || 'Label'}
      </label>
      <input
        type={(node.props.type as string) || 'text'}
        placeholder={(node.props.placeholder as string) || ''}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        readOnly
      />
    </div>
  ),
};

const LabelDef: ElementDef = {
  type: 'Label',
  kind: 'atom',
  label: 'Label',
  icon: IconLetterA,
  description: 'Small caption',
  propsSchema: [
    { key: 'text', label: 'Text', type: 'string', default: 'Section label' },
    {
      key: 'tone',
      label: 'Tone',
      type: 'select',
      default: 'muted',
      options: [
        { label: 'Muted', value: 'muted' },
        { label: 'Strong', value: 'strong' },
        { label: 'Primary', value: 'primary' },
      ],
    },
  ],
  Component: ({ node }) => {
    const tone = (node.props.tone as string) || 'muted';
    const cls =
      tone === 'strong'
        ? 'text-sm font-semibold text-foreground'
        : tone === 'primary'
          ? 'text-sm font-semibold uppercase tracking-wide text-primary'
          : 'text-sm font-medium text-muted-foreground';
    return <span className={cls}>{(node.props.text as string) || 'Label'}</span>;
  },
};

export const ATOM_DEFS: ElementDef[] = [
  HeadingDef,
  ParagraphDef,
  ButtonDef,
  ImageDef,
  LinkDef,
  IconDef,
  DividerDef,
  SpacerDef,
  BadgeDef,
  QuoteDef,
  BulletListDef,
  VideoDef,
  AvatarDef,
  InputFieldDef,
  LabelDef,
];
