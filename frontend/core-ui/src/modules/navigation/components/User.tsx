import { useAtomValue } from 'jotai';
import { currentUserState } from 'ui-modules';

export function User() {
  const currentUser = useAtomValue(currentUserState);

  const userDetail = currentUser?.details;

  if (!userDetail) return null;

  return (
    <div className="flex min-w-0 flex-1 items-center">
      <div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
        <span className="truncate font-semibold">{userDetail?.fullName}</span>
        <span className="truncate text-xs font-medium text-accent-foreground">
          {currentUser.email}
        </span>
      </div>
    </div>
  );
}
