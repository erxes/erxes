import { Avatar, readImage } from 'erxes-ui';
import { IUser } from 'ui-modules';

export const LogUserInfo = ({ user }: { user: IUser }) => {
  const { details } = user;
  const fullName = details?.fullName || '';
  const initials = fullName ? fullName.charAt(0).toUpperCase() : '';

  return (
    <div className="flex items-center gap-2">
      <Avatar className="h-6 w-6 rounded-full">
        <Avatar.Image src={readImage(details?.avatar || '')} alt={fullName} />
        <Avatar.Fallback className="rounded-lg text-black">
          {initials}
        </Avatar.Fallback>
      </Avatar>
      <span>{generateUserName(user)}</span>
    </div>
  );
};

const generateUserName = (user: IUser | undefined) => {
  if (!user) return '';

  if (user?.details?.fullName) {
    return user.details.fullName;
  }

  return user.email || '';
};
