import {
  IconAlignLeft,
  IconAlignRight,
  IconArrowsMaximize,
  IconPhoto,
} from '@tabler/icons-react';
import type { ImageStyleOption } from 'erxes-ui/modules/blocks/types/toolbar/ImageStyleOption';

export const IMAGE_STYLE_OPTIONS: ImageStyleOption[] = [
  { label: 'Normal', value: 'normal', Icon: IconPhoto },
  { label: 'Wide', value: 'wide', Icon: IconArrowsMaximize },
  { label: 'Float Left', value: 'float-left', Icon: IconAlignLeft },
  { label: 'Float Right', value: 'float-right', Icon: IconAlignRight },
];
