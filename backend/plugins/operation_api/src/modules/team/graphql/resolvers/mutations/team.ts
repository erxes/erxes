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
    { models, user, checkPermission }: IContext,
  ) => {
    await checkPermission('teamCreate');

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
      memberIds,
      estimateType,
      cycleEnabled,
      triageEnabled,
    }: {
      _id: string;
      name?: string;
      description?: string;
      icon?: string;
      memberIds?: string[];
      estimateType?: number;
      cycleEnabled?: boolean;
      triageEnabled?: boolean;
    },
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('teamUpdate');

    if (memberIds) {
      await checkPermission('teamMemberManage');
    }

    const team = await models.Team.updateTeam(_id, {
      name,
      description,
      icon,
      estimateType,
      cycleEnabled,
      triageEnabled,
    });

    if (memberIds) {
      await models.TeamMember.syncTeamMembers(_id, memberIds);
    }

    return team;
  },

  teamRemove: async (
    _parent: undefined,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('teamRemove');

    return models.Team.removeTeam(_id);
  },

  teamAddMembers: async (
    _parent: undefined,
    { _id, memberIds }: { _id: string; memberIds: string[] },
    { models, subdomain, user, checkPermission }: IContext,
  ) => {
    await checkPermission('teamMemberManage');

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
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('teamMemberManage');

    return models.TeamMember.removeTeamMember(teamId, memberId);
  },
};
