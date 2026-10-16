import { Tooltip } from 'erxes-ui/components';
import { ToolbarButton } from 'erxes-ui/modules/blocks/components/toolbar/buttons/ToolbarButton';
import { ToolbarToggle } from 'erxes-ui/modules/blocks/components/toolbar/buttons/ToolbarToggle';

export const editorUIComponents = {
  Button: { Button: ToolbarButton },
  Toggle: { Toggle: ToolbarToggle },
  Tooltip: {
    Tooltip,
    TooltipContent: Tooltip.Content,
    TooltipProvider: Tooltip.Provider,
    TooltipTrigger: Tooltip.Trigger,
  },
};
