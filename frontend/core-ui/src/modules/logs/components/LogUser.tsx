import { Avatar, cn, readImage } from 'erxes-ui';
import { IUser } from 'ui-modules';

export const LogUserInfo = ({
  user,
  email,
  variant = 'compact',
}: {
  user?: IUser;
  email?: string;
  variant?: 'compact' | 'card';
}) => {
  const details = user?.details;
  const fullName = details?.fullName || user?.email || email || 'Unknown user';
  const initials = fullName ? fullName.charAt(0).toUpperCase() : '';
  const secondaryEmail = email || user?.email || '';

  if (variant === 'card') {
    return (
      <div className="flex items-center gap-3 rounded-2xl border bg-background px-4 py-4">
        <Avatar className="h-12 w-12 rounded-full">
          <Avatar.Image src={readImage(details?.avatar || '')} alt={fullName} />
          <Avatar.Fallback className="rounded-full text-black">
            {initials}
          </Avatar.Fallback>
        </Avatar>
        <div className="min-w-0">
          <div className="truncate font-semibold text-foreground">
            {fullName}
          </div>
          {secondaryEmail && (
            <div className="truncate text-sm text-muted-foreground">
              {secondaryEmail}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn('flex items-center gap-2', !user && !email && 'opacity-70')}
    >
      <Avatar className="h-6 w-6 rounded-full">
        <Avatar.Image src={readImage(details?.avatar || '')} alt={fullName} />
        <Avatar.Fallback className="rounded-lg text-black">
          {initials}
        </Avatar.Fallback>
      </Avatar>
      <span>{generateUserName(user, email)}</span>
    </div>
  );
};

const generateUserName = (user: IUser | undefined, email?: string) => {
  if (!user) return email || 'Unknown user';

  if (user?.details?.fullName) {
    return user.details.fullName;
  }

  return user.email || email || 'Unknown user';
};
