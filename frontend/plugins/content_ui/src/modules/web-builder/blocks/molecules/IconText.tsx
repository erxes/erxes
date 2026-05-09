import { BlockDefinition } from '../types';
import {
  IconInfoCircle,
  IconAlertTriangle,
  IconCircleCheck,
  IconBulb,
} from '@tabler/icons-react';

interface IconTextProps {
  iconName: 'info' | 'warning' | 'check' | 'idea';
  text: string;
}

const ICONS = {
  info: IconInfoCircle,
  warning: IconAlertTriangle,
  check: IconCircleCheck,
  idea: IconBulb,
};

const TONE = {
  info: 'bg-blue-50 text-blue-900 border-blue-200',
  warning: 'bg-amber-50 text-amber-900 border-amber-200',
  check: 'bg-emerald-50 text-emerald-900 border-emerald-200',
  idea: 'bg-violet-50 text-violet-900 border-violet-200',
};

const IconTextRender = ({ props }: { props: IconTextProps }) => {
  const Icon = ICONS[props.iconName] || IconInfoCircle;
  const tone = TONE[props.iconName] || TONE.info;
  return (
    <div className={`flex gap-3 items-start border rounded-md p-3 ${tone}`}>
      <Icon size={18} className="shrink-0 mt-0.5" />
      <p className="text-sm">{props.text || 'Tip text'}</p>
    </div>
  );
};

export const iconTextBlock: BlockDefinition<IconTextProps> = {
  key: 'molecule.iconText',
  level: 'molecule',
  category: 'Content',
  label: 'Icon text',
  icon: IconInfoCircle,
  defaultProps: { iconName: 'info', text: 'A useful note or callout.' },
  propSchema: {
    iconName: {
      type: 'select',
      label: 'Tone',
      options: [
        { value: 'info', label: 'Info' },
        { value: 'warning', label: 'Warning' },
        { value: 'check', label: 'Success' },
        { value: 'idea', label: 'Idea' },
      ],
    },
    text: { type: 'longText', label: 'Text' },
  },
  Render: IconTextRender,
};
