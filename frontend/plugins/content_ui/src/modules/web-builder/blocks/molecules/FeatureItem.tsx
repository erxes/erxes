import { BlockDefinition } from '../types';
import {
  IconStar,
  IconBolt,
  IconShield,
  IconHeart,
  IconRocket,
  IconCircleCheck,
} from '@tabler/icons-react';

interface FeatureItemProps {
  iconName: 'star' | 'bolt' | 'shield' | 'heart' | 'rocket' | 'check';
  title: string;
  body: string;
}

const ICONS = {
  star: IconStar,
  bolt: IconBolt,
  shield: IconShield,
  heart: IconHeart,
  rocket: IconRocket,
  check: IconCircleCheck,
};

const FeatureItemRender = ({ props }: { props: FeatureItemProps }) => {
  const Icon = ICONS[props.iconName] || IconStar;
  return (
    <div className="flex gap-3 max-w-md">
      <div className="shrink-0 h-10 w-10 rounded-md bg-primary/10 text-primary flex items-center justify-center">
        <Icon size={20} />
      </div>
      <div className="space-y-1">
        <h4 className="font-semibold">{props.title || 'Feature'}</h4>
        <p className="text-sm text-muted-foreground">
          {props.body || 'Describe the feature in one sentence.'}
        </p>
      </div>
    </div>
  );
};

export const featureItemBlock: BlockDefinition<FeatureItemProps> = {
  key: 'molecule.featureItem',
  level: 'molecule',
  category: 'Content',
  label: 'Feature item',
  icon: IconStar,
  defaultProps: {
    iconName: 'star',
    title: 'Feature name',
    body: 'A one-sentence description of the feature.',
  },
  propSchema: {
    iconName: {
      type: 'select',
      label: 'Icon',
      options: [
        { value: 'star', label: 'Star' },
        { value: 'bolt', label: 'Bolt' },
        { value: 'shield', label: 'Shield' },
        { value: 'heart', label: 'Heart' },
        { value: 'rocket', label: 'Rocket' },
        { value: 'check', label: 'Check' },
      ],
    },
    title: { type: 'text', label: 'Title' },
    body: { type: 'longText', label: 'Body' },
  },
  Render: FeatureItemRender,
};
