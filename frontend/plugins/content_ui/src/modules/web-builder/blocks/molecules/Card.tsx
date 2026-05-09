import { BlockDefinition } from '../types';
import { IconCards } from '@tabler/icons-react';

interface CardProps {
  title: string;
  body: string;
  imageSrc: string;
  ctaLabel: string;
  ctaHref: string;
}

const CardRender = ({ props }: { props: CardProps }) => (
  <div className="rounded-lg border bg-card overflow-hidden shadow-sm max-w-md">
    {props.imageSrc ? (
      <div className="aspect-video bg-muted">
        <img
          src={props.imageSrc}
          alt=""
          className="w-full h-full object-cover"
        />
      </div>
    ) : null}
    <div className="p-5 space-y-2">
      <h3 className="text-lg font-semibold">{props.title || 'Card title'}</h3>
      <p className="text-sm text-muted-foreground">
        {props.body || 'Short description goes here.'}
      </p>
      {props.ctaLabel && (
        <a
          href={props.ctaHref || '#'}
          onClick={(e) => e.preventDefault()}
          className="inline-block text-sm font-medium text-primary hover:underline pt-1"
        >
          {props.ctaLabel} →
        </a>
      )}
    </div>
  </div>
);

export const cardBlock: BlockDefinition<CardProps> = {
  key: 'molecule.card',
  level: 'molecule',
  category: 'Content',
  label: 'Card',
  icon: IconCards,
  defaultProps: {
    title: 'Card title',
    body: 'A short summary that explains the value at a glance.',
    imageSrc: '',
    ctaLabel: 'Learn more',
    ctaHref: '#',
  },
  propSchema: {
    title: { type: 'text', label: 'Title' },
    body: { type: 'longText', label: 'Body' },
    imageSrc: { type: 'image', label: 'Image URL' },
    ctaLabel: { type: 'text', label: 'CTA label' },
    ctaHref: { type: 'url', label: 'CTA URL' },
  },
  Render: CardRender,
};
