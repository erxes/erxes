import { IconRefresh, IconUserUp } from '@tabler/icons-react';
import { Button, cn, NavigationMenuGroup, useQueryState } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { Link, useSearchParams } from 'react-router';
import { currentUserState } from 'ui-modules';

export const InboxActions = () => {
  const currentUser = useAtomValue(currentUserState);
  const [assignedTo, setAssignedTo] = useQueryState('assignedTo');
  const [searchParams] = useSearchParams();

  const hasNoSearchParams = [...searchParams].length === 0;

  return (
    <NavigationMenuGroup name="Actions">
      <Button
        variant="ghost"
        className={cn(
          'w-full justify-start flex-none',
          hasNoSearchParams && 'bg-muted',
        )}
        asChild
      >
        <Link to="/frontline/inbox">
          <IconRefresh className="text-accent-foreground" />
          Reset filters
        </Link>
      </Button>
      <Button
        variant="ghost"
        className={cn(
          'w-full justify-start flex-none',
          assignedTo === currentUser?._id && 'bg-muted',
        )}
        onClick={() => {
          setAssignedTo(currentUser?._id || '');
        }}
      >
        <IconUserUp className="text-accent-foreground" />
        Assigned to me
      </Button>
    </NavigationMenuGroup>
  );
};
