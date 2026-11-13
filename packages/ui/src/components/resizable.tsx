import { IconGripVertical } from '@tabler/icons-react';
import { Group, Panel, Separator } from 'react-resizable-panels';

import { cn } from 'erxes-ui/lib/utils';

// Group sets its own flex direction and full size. A Separator's aria-orientation is the
// line it draws, so it is "vertical" between the panels of a horizontal group.
const ResizableHandle = ({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof Separator> & {
  withHandle?: boolean;
}) => (
  <Separator
    className={cn(
      'relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 aria-[orientation=horizontal]:h-px aria-[orientation=horizontal]:w-full aria-[orientation=horizontal]:after:left-0 aria-[orientation=horizontal]:after:h-1 aria-[orientation=horizontal]:after:w-full aria-[orientation=horizontal]:after:-translate-y-1/2 aria-[orientation=horizontal]:after:translate-x-0 [&[aria-orientation=horizontal]>div]:rotate-90',
      className,
    )}
    {...props}
  >
    {withHandle && (
      <div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border">
        <IconGripVertical className="h-2.5 w-2.5" />
      </div>
    )}
  </Separator>
);

export const Resizable = {
  PanelGroup: Group,
  Panel,
  Handle: ResizableHandle,
};
