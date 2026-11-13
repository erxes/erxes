import type { ShadCNComponents } from '@blocknote/shadcn';
import { ToolbarButton } from 'erxes-ui/modules/blocks/components/toolbar/buttons/ToolbarButton';
import { ToolbarToggle } from 'erxes-ui/modules/blocks/components/toolbar/buttons/ToolbarToggle';

// BlockNote's own base-ui tooltips stay: its toolbar buttons render through the
// tooltip trigger's `render` prop, which the erxes (radix) Tooltip doesn't have.
export const editorUIComponents = {
  Button: { Button: ToolbarButton },
  Toggle: { Toggle: ToolbarToggle },
} satisfies Partial<ShadCNComponents>;
