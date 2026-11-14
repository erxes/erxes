import type { BlockNoteView } from '@blocknote/shadcn';
import type { ComponentProps } from 'react';
import { Tooltip } from 'erxes-ui/components';
import { ToolbarButton } from 'erxes-ui/modules/blocks/components/toolbar/buttons/ToolbarButton';
import { ToolbarToggle } from 'erxes-ui/modules/blocks/components/toolbar/buttons/ToolbarToggle';

export const editorUIComponents: NonNullable<
  ComponentProps<typeof BlockNoteView>['shadCNComponents']
> = {
  Button: { Button: ToolbarButton },
  Toggle: { Toggle: ToolbarToggle },
  Tooltip: {
    Tooltip,
    TooltipContent: Tooltip.Content,
    TooltipProvider: Tooltip.Provider,
    TooltipTrigger: Tooltip.Trigger,
  },
};
