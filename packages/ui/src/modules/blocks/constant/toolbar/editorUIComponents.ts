import type { BlockNoteView } from '@blocknote/shadcn';
import { memo, type ComponentProps } from 'react';
import { Tooltip } from 'erxes-ui/components/tooltip';
import { ToolbarButton } from 'erxes-ui/modules/blocks/components/toolbar/buttons/ToolbarButton';
import { ToolbarToggle } from 'erxes-ui/modules/blocks/components/toolbar/buttons/ToolbarToggle';

// BlockNote 0.35 types these slots as ForwardRefExoticComponent. memo() returns the same
// exotic component type around a plain function component, and the ref still passes as a prop.
export const editorUIComponents: NonNullable<
  ComponentProps<typeof BlockNoteView>['shadCNComponents']
> = {
  Button: { Button: memo(ToolbarButton) },
  Toggle: { Toggle: memo(ToolbarToggle) },
  Tooltip: {
    Tooltip,
    TooltipContent: memo(Tooltip.Content),
    TooltipProvider: Tooltip.Provider,
    TooltipTrigger: Tooltip.Trigger,
  },
};
