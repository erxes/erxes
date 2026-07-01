import { type IUser } from 'ui-modules';

export const getApprovalRequestUserName = (user?: IUser) => {
  const firstLastName = [user?.details?.firstName, user?.details?.lastName]
    .filter(Boolean)
    .join(' ');

  return (
    user?.details?.fullName ||
    firstLastName ||
    user?.email ||
    user?.username ||
    '-'
  );
};
