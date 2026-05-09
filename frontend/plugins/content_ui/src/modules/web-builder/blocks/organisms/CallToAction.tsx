import { BlockDefinition } from '../types';
import { IconRocket } from '@tabler/icons-react';

interface CtaProps {
  headline: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
  bg: 'primary' | 'muted' | 'plain';
}

const bgClass = {
  primary: 'bg-primary text-primary-foreground',
  muted: 'bg-muted text-foreground',
  plain: 'bg-background text-foreground border',
};

const ctaButtonClass = {
  primary: 'bg-background text-foreground hover:bg-background/90',
  muted: 'bg-primary text-primary-foreground hover:bg-primary/90',
  plain: 'bg-primary text-primary-foreground hover:bg-primary/90',
};

const CtaRender = ({ props }: { props: CtaProps }) => {
  const bg = props.bg || 'primary';
  return (
    <section className={`rounded-lg p-8 md:p-12 ${bgClass[bg]}`}>
      <div className="max-w-2xl mx-auto text-center space-y-4">
        <h2 className="text-2xl md:text-3xl font-bold">
          {props.headline || 'Ready to get started?'}
        </h2>
        {props.body && (
          <p className="opacity-80">{props.body}</p>
        )}
        {props.ctaLabel && (
          <a
            href={props.ctaHref || '#'}
            onClick={(e) => e.preventDefault()}
            className={`inline-block px-6 py-3 rounded-md font-medium ${ctaButtonClass[bg]}`}
          >
            {props.ctaLabel}
          </a>
        )}
      </div>
    </section>
  );
};

export const ctaBlock: BlockDefinition<CtaProps> = {
  key: 'organism.cta',
  level: 'organism',
  category: 'Sections',
  label: 'Call to action',
  icon: IconRocket,
  defaultProps: {
    headline: 'Ready to get started?',
    body: 'A one-line nudge to convert.',
    ctaLabel: 'Start free',
    ctaHref: '#',
    bg: 'primary',
  },
  propSchema: {
    headline: { type: 'text', label: 'Headline' },
    body: { type: 'longText', label: 'Body' },
    ctaLabel: { type: 'text', label: 'CTA label' },
    ctaHref: { type: 'url', label: 'CTA URL' },
    bg: {
      type: 'select',
      label: 'Background',
      options: [
        { value: 'primary', label: 'Primary' },
        { value: 'muted', label: 'Muted' },
        { value: 'plain', label: 'Plain' },
      ],
    },
  },
  Render: CtaRender,
};
