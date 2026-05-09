import { BlockDefinition } from '../types';
import { IconPhoto } from '@tabler/icons-react';

interface ImageProps {
  src: string;
  alt: string;
  aspectRatio: '16/9' | '4/3' | '1/1' | 'auto';
  rounded: 'none' | 'md' | 'lg' | 'full';
}

const aspectClass = {
  '16/9': 'aspect-video',
  '4/3': 'aspect-[4/3]',
  '1/1': 'aspect-square',
  auto: '',
};

const roundedClass = {
  none: '',
  md: 'rounded-md',
  lg: 'rounded-lg',
  full: 'rounded-full',
};

const ImageRender = ({ props }: { props: ImageProps }) => {
  const cls = `${aspectClass[props.aspectRatio || '16/9']} ${
    roundedClass[props.rounded || 'md']
  } w-full overflow-hidden bg-muted`;

  if (!props.src) {
    return (
      <div className={`${cls} flex items-center justify-center`}>
        <IconPhoto className="text-muted-foreground" size={48} />
      </div>
    );
  }

  return (
    <div className={cls}>
      <img
        src={props.src}
        alt={props.alt || ''}
        className="w-full h-full object-cover"
      />
    </div>
  );
};

export const imageAtomBlock: BlockDefinition<ImageProps> = {
  key: 'atom.image',
  level: 'atom',
  category: 'Media',
  label: 'Image',
  icon: IconPhoto,
  defaultProps: { src: '', alt: '', aspectRatio: '16/9', rounded: 'md' },
  propSchema: {
    src: { type: 'image', label: 'Image URL', placeholder: 'https://…' },
    alt: { type: 'text', label: 'Alt text' },
    aspectRatio: {
      type: 'select',
      label: 'Aspect ratio',
      options: [
        { value: '16/9', label: '16:9' },
        { value: '4/3', label: '4:3' },
        { value: '1/1', label: '1:1' },
        { value: 'auto', label: 'Auto' },
      ],
    },
    rounded: {
      type: 'select',
      label: 'Corners',
      options: [
        { value: 'none', label: 'None' },
        { value: 'md', label: 'Medium' },
        { value: 'lg', label: 'Large' },
        { value: 'full', label: 'Full' },
      ],
    },
  },
  Render: ImageRender,
};
