import { BlockDefinition } from '../types';
import { IconLayoutDashboard } from '@tabler/icons-react';

interface HeroProps {
  headline: string;
  subhead: string;
  imageSrc: string;
  ctaLabel: string;
  ctaHref: string;
  layout: 'split' | 'centered';
}

const HeroRender = ({ props }: { props: HeroProps }) => {
  if (props.layout === 'centered') {
    return (
      <section className="py-16 md:py-24 px-6 text-center max-w-3xl mx-auto space-y-5">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          {props.headline || 'Bold, clear headline'}
        </h1>
        <p className="text-lg text-muted-foreground">
          {props.subhead || 'A short supporting line that says why this matters.'}
        </p>
        {props.ctaLabel && (
          <a
            href={props.ctaHref || '#'}
            onClick={(e) => e.preventDefault()}
            className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium hover:bg-primary/90"
          >
            {props.ctaLabel}
          </a>
        )}
      </section>
    );
  }

  return (
    <section className="py-12 md:py-20 px-6 grid md:grid-cols-2 gap-10 items-center">
      <div className="space-y-5">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          {props.headline || 'Bold, clear headline'}
        </h1>
        <p className="text-lg text-muted-foreground">
          {props.subhead || 'A short supporting line that says why this matters.'}
        </p>
        {props.ctaLabel && (
          <a
            href={props.ctaHref || '#'}
            onClick={(e) => e.preventDefault()}
            className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium hover:bg-primary/90"
          >
            {props.ctaLabel}
          </a>
        )}
      </div>
      <div className="aspect-video rounded-lg bg-muted overflow-hidden">
        {props.imageSrc ? (
          <img
            src={props.imageSrc}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : null}
      </div>
    </section>
  );
};

export const heroBlock: BlockDefinition<HeroProps> = {
  key: 'organism.hero',
  level: 'organism',
  category: 'Sections',
  label: 'Hero',
  icon: IconLayoutDashboard,
  defaultProps: {
    headline: 'Build something people love',
    subhead: 'A short, persuasive subhead that supports the headline.',
    imageSrc: '',
    ctaLabel: 'Get started',
    ctaHref: '#',
    layout: 'split',
  },
  propSchema: {
    headline: { type: 'text', label: 'Headline' },
    subhead: { type: 'longText', label: 'Subhead' },
    imageSrc: { type: 'image', label: 'Image URL' },
    ctaLabel: { type: 'text', label: 'CTA label' },
    ctaHref: { type: 'url', label: 'CTA URL' },
    layout: {
      type: 'select',
      label: 'Layout',
      options: [
        { value: 'split', label: 'Split (image right)' },
        { value: 'centered', label: 'Centered' },
      ],
    },
  },
  Render: HeroRender,
};
