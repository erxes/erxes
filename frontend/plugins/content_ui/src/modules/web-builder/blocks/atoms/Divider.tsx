import { BlockDefinition } from '../types';
import { IconMinus } from '@tabler/icons-react';

interface DividerProps {
  thickness: number;
  color: string;
}

const DividerRender = ({ props }: { props: DividerProps }) => (
  <hr
    style={{
      borderTopWidth: `${props.thickness ?? 1}px`,
      borderTopColor: props.color || '#e5e7eb',
      borderStyle: 'solid',
    }}
    className="w-full"
  />
);

export const dividerBlock: BlockDefinition<DividerProps> = {
  key: 'atom.divider',
  level: 'atom',
  category: 'Layout',
  label: 'Divider',
  icon: IconMinus,
  defaultProps: { thickness: 1, color: '#e5e7eb' },
  propSchema: {
    thickness: { type: 'number', label: 'Thickness (px)', min: 1, max: 12 },
    color: { type: 'color', label: 'Color' },
  },
  Render: DividerRender,
};
