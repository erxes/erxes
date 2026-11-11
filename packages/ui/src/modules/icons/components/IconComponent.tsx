import React from 'react';
import { useIcons } from '../hooks/useIcons';
import { TablerIcon } from '@tabler/icons-react';

export const IconComponent = React.forwardRef<
  TablerIcon,
  React.ComponentPropsWithoutRef<TablerIcon> & { name?: string }
>(({ name, ...props }, ref) => {
  const { getIcon } = useIcons();
  const Icon = getIcon(name);

  return <Icon ref={ref} {...props} />;
});
