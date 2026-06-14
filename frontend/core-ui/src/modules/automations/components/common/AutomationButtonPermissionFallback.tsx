import { IconLock } from '@tabler/icons-react';
import { Button } from 'erxes-ui';

export const AutomationButtonPermissionFallback = () => {
  return (
    <Button variant="secondary" disabled>
      <IconLock />
      No permission
    </Button>
  );
};
