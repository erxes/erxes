import { IconRefresh, IconUserUp } from '@tabler/icons-react';
import { Button, cn, NavigationMenuGroup, useQueryState } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { Link } from 'react-router';
import { currentUserState } from 'ui-modules';
import { useTranslation } from 'react-i18next';

export const InboxActions = () => {
  const { t } = useTranslation('frontline');
  const currentUser = useAtomValue(currentUserState);
  const [assignedTo, setAssignedTo] = useQueryState('assignedTo');

  return (
    <NavigationMenuGroup name="Actions">
      <Button
        variant="ghost"
        className={cn('w-full justify-start flex-none')}
        asChild
      >
        <Link to="/frontline/inbox">
          <IconRefresh className="text-accent-foreground" />
          {t('reset-filters')}
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
        {t('assigned-to-me')}
      </Button>
    </NavigationMenuGroup>
  );
};
