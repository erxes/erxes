import { TeamMemberRoles } from '@/team/@types/team';
// import { checkUserRole } from '@/utils';
import { requireLogin } from 'erxes-api-shared/core-modules';
import { IContext } from '~/connectionResolvers';
import { createNotifications } from '~/utils/notifications';

export const teamMutations = {
  teamAdd: async (
    _parent: undefined,
    {
      name,
      description,
      icon,
      memberIds,
    }: { name: string; description: string; icon: string; memberIds: string[] },
    { models, user }: IContext,
  ) => {
    const userId = user._id;
    memberIds = memberIds || [];
    memberIds = memberIds.includes(userId)
      ? memberIds.filter((id) => id !== userId)
      : [...memberIds];

    return models.Team.createTeam({
      teamDoc: {
        name,
        description,
        icon,
        estimateType: 1,
      },
      memberIds,
      adminId: userId,
    });
  },

  teamUpdate: async (
    _parent: undefined,
    {
      _id,
      name,
      description,
      icon,
      estimateType,
      cycleEnabled,
      triageEnabled,
    }: {
      _id: string;
      name: string;
      description: string;
      icon: string;
      estimateType: number;
      cycleEnabled: boolean;
      triageEnabled: boolean;
    },
    { models }: IContext,
  ) => {
    // ** Deprecated
    // await checkUserRole({
    //   models,
    //   teamId: _id,
    //   userId: user._id,
    //   allowedRoles: [TeamMemberRoles.ADMIN, TeamMemberRoles.LEAD],
    // });

    return models.Team.updateTeam(_id, {
      name,
      description,
      icon,
      estimateType,
      cycleEnabled,
      triageEnabled,
    });
  },

  teamRemove: async (
    _parent: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) => {
    // ** Deprecated
    // await checkUserRole({
    //   models,
    //   teamId: _id,
    //   userId: user._id,
    //   allowedRoles: [TeamMemberRoles.ADMIN],
    // });

    return models.Team.removeTeam(_id);
  },

  teamAddMembers: async (
    _parent: undefined,
    { _id, memberIds }: { _id: string; memberIds: string[] },
    { models, subdomain, user }: IContext,
  ) => {
    // ** Deprecated
    // await checkUserRole({
    //   models,
    //   teamId: _id,
    //   userId: user._id,
    //   allowedRoles: [TeamMemberRoles.ADMIN, TeamMemberRoles.LEAD],
    // });

    await createNotifications({
      contentType: 'team',
      contentTypeId: _id,
      fromUserId: user._id,
      subdomain,
      notificationType: 'team',
      userIds: memberIds,
      action: 'teamAddMembers',
      models,
    });

    return models.TeamMember.createTeamMembers(
      memberIds.map((memberId) => ({
        memberId,
        teamId: _id,
      })),
    );
  },

  teamRemoveMember: async (
    _parent: undefined,
    { teamId, memberId }: { teamId: string; memberId: string },
    { models }: IContext,
  ) => {
    // ** Deprecated
    // await checkUserRole({
    //   models,
    //   teamId,
    //   userId: user._id,
    //   allowedRoles: [TeamMemberRoles.ADMIN],
    // });

    return models.TeamMember.removeTeamMember(teamId, memberId);
  },

  teamUpdateMember: async (
    _parent: undefined,
    { _id, role }: { _id: string; memberId: string; role: TeamMemberRoles },
    { models }: IContext,
  ) => {
    const teamMember = await models.TeamMember.findOne({ _id });

    if (!teamMember) {
      throw new Error('Team member not found');
    }

    // ** Deprecated
    // await checkUserRole({
    //   models,
    //   teamId: teamMember.teamId,
    //   userId: user._id,
    //   allowedRoles: [TeamMemberRoles.ADMIN],
    // });

    return models.TeamMember.updateTeamMember(_id, role);
  },
};

requireLogin(teamMutations, 'teamAdd');
requireLogin(teamMutations, 'teamUpdate');
requireLogin(teamMutations, 'teamRemove');
requireLogin(teamMutations, 'teamAddMembers');
requireLogin(teamMutations, 'teamRemoveMember');
requireLogin(teamMutations, 'teamUpdateMember');
