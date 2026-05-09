import { BlockDefinition } from '../types';
import { IconHeading } from '@tabler/icons-react';

interface HeadingProps {
  text: string;
  level: '1' | '2' | '3' | '4';
  align: 'left' | 'center' | 'right';
}

const alignClass = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

const sizeClass: Record<HeadingProps['level'], string> = {
  '1': 'text-4xl md:text-5xl font-bold',
  '2': 'text-3xl md:text-4xl font-bold',
  '3': 'text-2xl md:text-3xl font-semibold',
  '4': 'text-xl md:text-2xl font-semibold',
};

const HeadingRender = ({ props }: { props: HeadingProps }) => {
  const Tag = (`h${props.level || '2'}` as 'h1' | 'h2' | 'h3' | 'h4');
  return (
    <Tag
      className={`${sizeClass[props.level || '2']} ${
        alignClass[props.align || 'left']
      } tracking-tight`}
    >
      {props.text || 'Heading'}
    </Tag>
  );
};

export const headingBlock: BlockDefinition<HeadingProps> = {
  key: 'atom.heading',
  level: 'atom',
  category: 'Text',
  label: 'Heading',
  icon: IconHeading,
  defaultProps: { text: 'Your headline here', level: '2', align: 'left' },
  propSchema: {
    text: { type: 'text', label: 'Text' },
    level: {
      type: 'select',
      label: 'Level',
      options: [
        { value: '1', label: 'H1' },
        { value: '2', label: 'H2' },
        { value: '3', label: 'H3' },
        { value: '4', label: 'H4' },
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
  Render: HeadingRender,
};
