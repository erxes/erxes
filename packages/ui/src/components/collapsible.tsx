import { Collapsible as CollapsiblePrimitive } from '@base-ui/react/collapsible';
import React from 'react';
import { cn } from 'erxes-ui/lib/utils';
import { IconCaretDownFilled } from '@tabler/icons-react';

const TriggerIcon = ({ className, ...props }: React.ComponentProps<typeof IconCaretDownFilled>) => (
  <IconCaretDownFilled
    className={cn(
      '-rotate-90 transition-transform duration-100 in-data-panel-open:rotate-0',
      className,
    )}
    {...props}
  />
);

export const Collapsible = Object.assign(CollapsiblePrimitive.Root, {
  Trigger: CollapsiblePrimitive.Trigger,
  TriggerIcon: TriggerIcon,
  Panel: CollapsiblePrimitive.Panel,
});
