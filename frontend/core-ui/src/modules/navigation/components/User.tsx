import { IconSelector } from '@tabler/icons-react';
import { currentUserState } from 'ui-modules';
import { Avatar } from 'erxes-ui';
import { readImage } from 'erxes-ui';
import { useAtomValue } from 'jotai';

export function User() {
  const currentUser = useAtomValue(currentUserState);

  const userDetail = currentUser?.details;

  if (!userDetail) return null;

  return (
    <div className="flex items-center gap-2 h-auto p-2">
      <Avatar className="h-8 w-8 rounded-lg">
        <Avatar.Image
          src={readImage(userDetail?.avatar || '')}
          alt={userDetail?.fullName || ''}
        />
        <Avatar.Fallback className="rounded-lg">
          {userDetail?.fullName?.split('')[0]}
        </Avatar.Fallback>
      </Avatar>
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-semibold">{userDetail?.fullName}</span>
        <span className="truncate text-xs text-accent-foreground font-medium">
          {currentUser.email}
        </span>
      </div>
    </div>
  );
}
