import { Model } from 'mongoose';
import {
  ITeam,
  ITeamDocument,
  ITeamMember,
  TeamEstimateTypes,
  TeamMemberRoles,
} from '@/team/@types/team';
import { ITeamFilter } from '@/team/@types/team';
import { teamSchema } from '@/team/db/definitions/team';
import { IModels } from '~/connectionResolvers';
import { FilterQuery } from 'mongoose';

export interface ITeamModel extends Model<ITeamDocument> {
  getTeam(_id: string): Promise<ITeamDocument>;
  getTeams(params: ITeamFilter): Promise<ITeamDocument[]>;
  getTeamsByMember(memberId: string): Promise<ITeamDocument[]>;
  createTeam({
    teamDoc,
    memberIds,
    adminId,
  }: {
    teamDoc: ITeam;
    memberIds: string[];
    adminId: string;
  }): Promise<ITeamDocument>;
  addMembers(_id: string, memberIds: string[]): Promise<ITeamDocument>;
  updateTeam(_id: string, doc: ITeam): Promise<ITeamDocument>;
  removeTeam(teamId: string): Promise<{ ok: number }>;
}

export const loadTeamClass = (models: IModels) => {
  class Team {
    public static async getTeam(_id: string) {
      const team = await models.Team.findOne({ _id }).lean();

      if (!team) {
        throw new Error('Team not found');
      }

      return team;
    }

    public static async getTeamsByMember(
      memberId: string,
    ): Promise<ITeamDocument[]> {
      return models.Team.find({ memberIds: memberId }).lean();
    }

    public static async getTeams(
      params: ITeamFilter,
    ): Promise<ITeamDocument[]> {
      const query: FilterQuery<ITeamDocument> = {};

      if (params.name) {
        query.name = params.name;
      }

      if (params.description) {
        query.description = params.description;
      }

      if (params.icon) {
        query.icon = params.icon;
      }

      if (params.userId) {
        const teamIds = await models.TeamMember.find({
          memberId: params.userId,
        }).distinct('teamId');

        query._id = { $in: teamIds };
      }

      return models.Team.find(query).lean();
    }

    public static async createTeam({
      teamDoc,
      memberIds,
      adminId,
    }: {
      teamDoc: ITeam;
      memberIds: string[];
      adminId: string;
    }): Promise<ITeamDocument> {
      const roles: ITeamMember[] = [];

      const team = await models.Team.insertOne(teamDoc);

      roles.push(
        { memberId: adminId, teamId: team._id, role: TeamMemberRoles.ADMIN },
        ...memberIds.map((memberId) => ({
          memberId,
          teamId: team._id,
          role: TeamMemberRoles.MEMBER,
        })),
      );

      await models.TeamMember.createTeamMembers(roles);

      await models.Status.createDefaultStatuses(team._id);

      return team;
    }

    public static async updateTeam(_id: string, doc: ITeam) {
      const team = await models.Team.findOne({ _id });

      if (!team) {
        throw new Error('Team not found');
      }

      if (doc.estimateType !== team.estimateType) {
        switch (doc.estimateType) {
          case TeamEstimateTypes.NOT_IN_USE:
            await models.Task.updateMany(
              { teamId: _id },
              { $set: { estimatePoint: null } },
            );
            break;

          default:
            break;
        }
      }

      return await models.Team.findOneAndUpdate({ _id }, { $set: { ...doc } });
    }

    public static async removeTeam(teamId: string) {
      return models.Team.deleteOne({ _id: teamId });
    }
  }

  teamSchema.loadClass(Team);

  return teamSchema;
};
