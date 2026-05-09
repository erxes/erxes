import { BlockDefinition } from '../types';
import { IconHandClick } from '@tabler/icons-react';

interface ButtonProps {
  label: string;
  href: string;
  variant: 'primary' | 'outline' | 'ghost';
  align: 'left' | 'center' | 'right';
}

const variantClass = {
  primary:
    'bg-primary text-primary-foreground hover:bg-primary/90 px-5 py-2.5 rounded-md font-medium',
  outline:
    'border border-primary text-primary hover:bg-primary/5 px-5 py-2.5 rounded-md font-medium',
  ghost:
    'text-primary hover:bg-primary/5 px-5 py-2.5 rounded-md font-medium',
};

const alignClass = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
};

const ButtonRender = ({ props }: { props: ButtonProps }) => (
  <div className={`flex ${alignClass[props.align || 'left']}`}>
    <a
      href={props.href || '#'}
      onClick={(e) => e.preventDefault()}
      className={`inline-block ${variantClass[props.variant || 'primary']}`}
    >
      {props.label || 'Click me'}
    </a>
  </div>
);

export const buttonAtomBlock: BlockDefinition<ButtonProps> = {
  key: 'atom.button',
  level: 'atom',
  category: 'Action',
  label: 'Button',
  icon: IconHandClick,
  defaultProps: {
    label: 'Get started',
    href: '#',
    variant: 'primary',
    align: 'left',
  },
  propSchema: {
    label: { type: 'text', label: 'Label' },
    href: { type: 'url', label: 'Link URL', placeholder: 'https://…' },
    variant: {
      type: 'select',
      label: 'Variant',
      options: [
        { value: 'primary', label: 'Primary' },
        { value: 'outline', label: 'Outline' },
        { value: 'ghost', label: 'Ghost' },
      ],
    },
    align: {
      type: 'select',
      label: 'Alignment',
      options: [
        { value: 'left', label: 'Left' },
        { value: 'center', label: 'Center' },
        { value: 'right', label: 'Right' },
      ],
    },
  },
  Render: ButtonRender,
};
