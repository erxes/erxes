import { BlockDefinition } from '../types';
import { IconAlignLeft } from '@tabler/icons-react';

interface ParagraphProps {
  text: string;
  align: 'left' | 'center' | 'right';
  size: 'sm' | 'base' | 'lg';
}

const alignClass = { left: 'text-left', center: 'text-center', right: 'text-right' };
const sizeClass = { sm: 'text-sm', base: 'text-base', lg: 'text-lg' };

const ParagraphRender = ({ props }: { props: ParagraphProps }) => (
  <p
    className={`${sizeClass[props.size || 'base']} ${
      alignClass[props.align || 'left']
    } text-muted-foreground leading-relaxed whitespace-pre-wrap`}
  >
    {props.text || 'Paragraph text…'}
  </p>
);

export const paragraphBlock: BlockDefinition<ParagraphProps> = {
  key: 'atom.paragraph',
  level: 'atom',
  category: 'Text',
  label: 'Paragraph',
  icon: IconAlignLeft,
  defaultProps: { text: 'Write something compelling.', align: 'left', size: 'base' },
  propSchema: {
    text: { type: 'longText', label: 'Text' },
    align: {
      type: 'select',
      label: 'Alignment',
      options: [
        { value: 'left', label: 'Left' },
        { value: 'center', label: 'Center' },
        { value: 'right', label: 'Right' },
      ],
    },
    size: {
      type: 'select',
      label: 'Size',
      options: [
        { value: 'sm', label: 'Small' },
        { value: 'base', label: 'Base' },
        { value: 'lg', label: 'Large' },
      ],
    },
  },
  Render: ParagraphRender,
};
