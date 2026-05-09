import { BlockDefinition } from '../types';
import { IconArrowsVertical } from '@tabler/icons-react';

interface SpacerProps {
  height: number;
}

const SpacerRender = ({ props }: { props: SpacerProps }) => (
  <div style={{ height: `${props.height ?? 32}px` }} aria-hidden />
);

export const spacerBlock: BlockDefinition<SpacerProps> = {
  key: 'atom.spacer',
  level: 'atom',
  category: 'Layout',
  label: 'Spacer',
  icon: IconArrowsVertical,
  defaultProps: { height: 32 },
  propSchema: {
    height: { type: 'number', label: 'Height (px)', min: 4, max: 320 },
  },
  Render: SpacerRender,
};
