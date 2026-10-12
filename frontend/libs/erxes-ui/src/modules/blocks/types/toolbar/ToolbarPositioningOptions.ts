import type { ComponentProps } from 'react';
import type { FormattingToolbarController } from '@blocknote/react';

export type ToolbarPositioningOptions = ComponentProps<
  typeof FormattingToolbarController
>['floatingOptions'];
