import { IUser } from '@/settings/team-member/types';
import { readImage } from 'erxes-ui';

const userNameOf = (user: IUser) => {
  const { firstName, lastName } = user.details || {};

  if (firstName || lastName) {
    return `${firstName || ''} ${lastName || ''}`;
  }

  return user.email;
};

/** A team member as shown in a list cell: link, avatar and name. */
export const useAutomationRecordTableUser = (user: IUser) => ({
  href: `/settings/team/members?user_id=${user._id}`,
  avatarSrc: readImage(user.details?.avatar),
  fullName: user.details?.fullName || '',
  initial: (user.details?.fullName || '').charAt(0),
  name: userNameOf(user),
});
