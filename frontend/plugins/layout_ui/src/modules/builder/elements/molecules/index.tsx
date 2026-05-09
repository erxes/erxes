import {
  IconChartBar,
  IconCircleCheck,
  IconLink,
  IconMessage2,
  IconReceipt2,
  IconStack2,
  IconUsersGroup,
} from '@tabler/icons-react';

import { ElementDef } from '../types';
import { ICON_OPTIONS, renderIcon } from '../iconMap';

const CardDef: ElementDef = {
  type: 'Card',
  kind: 'molecule',
  label: 'Card',
  icon: IconStack2,
  description: 'Image + heading + text + button',
  propsSchema: [
    {
      key: 'imageUrl',
      label: 'Image URL',
      type: 'image',
      default:
        'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800',
    },
    { key: 'heading', label: 'Heading', type: 'string', default: 'Card title' },
    {
      key: 'description',
      label: 'Description',
      type: 'text',
      default: 'A short paragraph that explains the card content briefly.',
    },
    { key: 'buttonLabel', label: 'Button label', type: 'string', default: 'Learn more' },
    { key: 'buttonUrl', label: 'Button URL', type: 'url', default: '#' },
  ],
  Component: ({ node }) => (
    <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
      <img
        src={(node.props.imageUrl as string) || ''}
        alt=""
        className="h-48 w-full object-cover"
      />
      <div className="space-y-3 p-5">
        <h3 className="text-lg font-semibold">
          {(node.props.heading as string) || 'Heading'}
        </h3>
        <p className="text-sm text-muted-foreground">
          {(node.props.description as string) || ''}
        </p>
        <a
          href={(node.props.buttonUrl as string) || '#'}
          className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          {(node.props.buttonLabel as string) || 'Action'}
        </a>
      </div>
    </div>
  ),
};

const FeatureItemDef: ElementDef = {
  type: 'FeatureItem',
  kind: 'molecule',
  label: 'Feature',
  icon: IconCircleCheck,
  description: 'Icon + heading + description',
  propsSchema: [
    {
      key: 'iconName',
      label: 'Icon',
      type: 'select',
      default: 'IconBolt',
      options: ICON_OPTIONS,
    },
    { key: 'heading', label: 'Heading', type: 'string', default: 'Fast' },
    {
      key: 'description',
      label: 'Description',
      type: 'text',
      default: 'A short reason this feature matters to your users.',
    },
  ],
  Component: ({ node }) => (
    <div className="flex flex-col items-start gap-3">
      <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 text-primary">
        {renderIcon((node.props.iconName as string) || 'IconBolt', { size: 24 })}
      </div>
      <h3 className="text-lg font-semibold">
        {(node.props.heading as string) || ''}
      </h3>
      <p className="text-sm text-muted-foreground">
        {(node.props.description as string) || ''}
      </p>
    </div>
  ),
};

const PricingCardDef: ElementDef = {
  type: 'PricingCard',
  kind: 'molecule',
  label: 'Pricing card',
  icon: IconReceipt2,
  description: 'Tier with feature list',
  propsSchema: [
    { key: 'tier', label: 'Tier label', type: 'string', default: 'Pro' },
    { key: 'price', label: 'Price', type: 'string', default: '$29' },
    { key: 'period', label: 'Period', type: 'string', default: '/ month' },
    {
      key: 'features',
      label: 'Features (one per line)',
      type: 'text',
      default: 'Unlimited projects\nPriority support\nCustom domain',
    },
    { key: 'buttonLabel', label: 'Button label', type: 'string', default: 'Choose plan' },
    { key: 'buttonUrl', label: 'Button URL', type: 'url', default: '#' },
    { key: 'highlighted', label: 'Highlight', type: 'boolean', default: false },
  ],
  Component: ({ node }) => {
    const features = ((node.props.features as string) || '')
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const highlighted = !!node.props.highlighted;
    return (
      <div
        className={`rounded-lg border bg-card p-6 shadow-sm ${
          highlighted ? 'border-primary ring-2 ring-primary/40' : ''
        }`}
      >
        <div className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          {(node.props.tier as string) || 'Tier'}
        </div>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-4xl font-bold">
            {(node.props.price as string) || '$0'}
          </span>
          <span className="text-sm text-muted-foreground">
            {(node.props.period as string) || ''}
          </span>
        </div>
        <ul className="mt-4 space-y-2 text-sm">
          {features.map((f, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-0.5 text-primary">✓</span>
              <span>{f}</span>
            </li>
          ))}
        </ul>
        <a
          href={(node.props.buttonUrl as string) || '#'}
          className={`mt-6 inline-flex h-10 w-full items-center justify-center rounded-md px-4 text-sm font-medium ${
            highlighted
              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
              : 'border border-input hover:bg-muted'
          }`}
        >
          {(node.props.buttonLabel as string) || 'Choose plan'}
        </a>
      </div>
    );
  },
};

const TestimonialDef: ElementDef = {
  type: 'Testimonial',
  kind: 'molecule',
  label: 'Testimonial',
  icon: IconMessage2,
  description: 'Avatar + quote + author',
  propsSchema: [
    {
      key: 'avatar',
      label: 'Avatar URL',
      type: 'image',
      default:
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160',
    },
    {
      key: 'quote',
      label: 'Quote',
      type: 'text',
      default:
        'Switching saved us weeks of engineering time and our marketing team can finally ship pages on their own.',
    },
    { key: 'author', label: 'Author', type: 'string', default: 'Jane Doe' },
    { key: 'role', label: 'Role', type: 'string', default: 'CEO, Acme' },
  ],
  Component: ({ node }) => (
    <figure className="rounded-lg border bg-card p-6 shadow-sm">
      <blockquote className="text-base italic text-foreground">
        "{(node.props.quote as string) || ''}"
      </blockquote>
      <figcaption className="mt-4 flex items-center gap-3">
        <img
          src={(node.props.avatar as string) || ''}
          alt=""
          className="h-10 w-10 rounded-full object-cover"
        />
        <div>
          <div className="text-sm font-semibold">
            {(node.props.author as string) || ''}
          </div>
          <div className="text-xs text-muted-foreground">
            {(node.props.role as string) || ''}
          </div>
        </div>
      </figcaption>
    </figure>
  ),
};

const ContactFormDef: ElementDef = {
  type: 'ContactForm',
  kind: 'molecule',
  label: 'Contact form',
  icon: IconUsersGroup,
  description: 'Visual contact form',
  propsSchema: [
    { key: 'heading', label: 'Heading', type: 'string', default: 'Get in touch' },
    { key: 'nameLabel', label: 'Name label', type: 'string', default: 'Name' },
    { key: 'emailLabel', label: 'Email label', type: 'string', default: 'Email' },
    { key: 'messageLabel', label: 'Message label', type: 'string', default: 'Message' },
    { key: 'buttonLabel', label: 'Button label', type: 'string', default: 'Send' },
  ],
  Component: ({ node }) => (
    <form
      className="space-y-4 rounded-lg border bg-card p-6 shadow-sm"
      onSubmit={(e) => e.preventDefault()}
    >
      <h3 className="text-lg font-semibold">
        {(node.props.heading as string) || 'Get in touch'}
      </h3>
      <div className="space-y-1">
        <label className="text-sm font-medium">
          {(node.props.nameLabel as string) || 'Name'}
        </label>
        <input
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          readOnly
        />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium">
          {(node.props.emailLabel as string) || 'Email'}
        </label>
        <input
          type="email"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          readOnly
        />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium">
          {(node.props.messageLabel as string) || 'Message'}
        </label>
        <textarea
          rows={4}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          readOnly
        />
      </div>
      <button
        type="submit"
        className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        {(node.props.buttonLabel as string) || 'Send'}
      </button>
    </form>
  ),
};

const NavLinkDef: ElementDef = {
  type: 'NavLink',
  kind: 'molecule',
  label: 'Nav link',
  icon: IconLink,
  description: 'Icon + label + url',
  propsSchema: [
    {
      key: 'iconName',
      label: 'Icon',
      type: 'select',
      default: 'IconLink',
      options: ICON_OPTIONS,
    },
    { key: 'label', label: 'Label', type: 'string', default: 'Home' },
    { key: 'url', label: 'URL', type: 'url', default: '#' },
  ],
  Component: ({ node }) => (
    <a
      href={(node.props.url as string) || '#'}
      className="inline-flex items-center gap-2 text-sm text-foreground hover:text-primary"
    >
      {renderIcon((node.props.iconName as string) || 'IconLink', { size: 16 })}
      <span>{(node.props.label as string) || 'Link'}</span>
    </a>
  ),
};

const StatCardDef: ElementDef = {
  type: 'StatCard',
  kind: 'molecule',
  label: 'Stat card',
  icon: IconChartBar,
  description: 'Big number + label + trend',
  propsSchema: [
    { key: 'value', label: 'Value', type: 'string', default: '12,438' },
    { key: 'label', label: 'Label', type: 'string', default: 'Active users' },
    { key: 'delta', label: 'Delta', type: 'string', default: '+12%' },
    {
      key: 'tone',
      label: 'Tone',
      type: 'select',
      default: 'positive',
      options: [
        { label: 'Positive', value: 'positive' },
        { label: 'Negative', value: 'negative' },
        { label: 'Neutral', value: 'neutral' },
      ],
    },
  ],
  Component: ({ node }) => {
    const tone = (node.props.tone as string) || 'positive';
    const toneClass =
      tone === 'positive'
        ? 'text-emerald-600'
        : tone === 'negative'
          ? 'text-red-600'
          : 'text-muted-foreground';
    return (
      <div className="rounded-lg border bg-card p-5 shadow-sm">
        <div className="text-sm text-muted-foreground">
          {(node.props.label as string) || 'Label'}
        </div>
        <div className="mt-1 text-3xl font-bold">
          {(node.props.value as string) || '0'}
        </div>
        <div className={`mt-1 text-sm font-medium ${toneClass}`}>
          {(node.props.delta as string) || ''}
        </div>
      </div>
    );
  },
};

export const MOLECULE_DEFS: ElementDef[] = [
  CardDef,
  FeatureItemDef,
  PricingCardDef,
  TestimonialDef,
  ContactFormDef,
  NavLinkDef,
  StatCardDef,
];
