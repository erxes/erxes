import { Tooltip } from 'erxes-ui/components';
import { ToolbarButton } from '../components/ToolbarButton';
import { ToolbarToggle } from '../components/ToolbarToggle';

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
