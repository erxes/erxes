import { IModels } from '~/connectionResolvers';
import { TeamMemberRoles } from '~/modules/team/@types/team';

export const checkUserRole = async ({
  models,
  teamId,
  userId,
  allowedRoles,
  teamIds,
}: {
  models: IModels;
  teamId?: string;
  userId: string;
  allowedRoles: string[];
  teamIds?: string[];
}) => {
  const userRole = await models.TeamMember.findOne({
    teamId,
    memberId: userId,
  });

  if (userRole?.role === TeamMemberRoles.MEMBER) {
    return;
  }

  if (teamIds && teamIds.length > 0) {
    const userRoles = await models.TeamMember.find({
      teamId: { $in: teamIds },
      memberId: userId,
    });

    if (!userRoles || userRoles.length === 0) {
      throw new Error('User not in team');
    }

    let isAllowed = false;

    userRoles.forEach((userRole) => {
      if (allowedRoles.includes(userRole.role)) {
        isAllowed = true;
      }
    });

    if (!isAllowed) {
      throw new Error('User is not allowed to perform this action');
    }

    return;
  }

  if (!userRole) {
    throw new Error('User not in team');
  }

  if (!allowedRoles.includes(userRole.role)) {
    throw new Error('User is not allowed to perform this action');
  }

  return;
};
