// getStatusIcon.tsx
import type { TablerIconsProps } from '@tabler/icons-react';

import {
  IconCircleDashed,
  IconCircle,
  IconCircleDot,
  IconCircleCheck,
  IconCircleX,
} from '@tabler/icons-react';

export const getStatusIcon = (statusType: string) => {
  switch (statusType) {
    case 'backlog':
      return <IconCircleDashed color="" />;
    case 'unstarted':
      return <IconCircle color="" />;
    case 'started':
      return <IconCircleDot />;
    case 'completed':
      return <IconCircleCheck />;
    case 'cancelled':
      return <IconCircleX />;
    default:
      return <IconCircleDashed />;
  }
};
