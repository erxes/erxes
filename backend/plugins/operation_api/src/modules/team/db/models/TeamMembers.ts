import {
  ITeamMember,
  ITeamMemberDocument,
  TeamMemberRoles,
} from '@/team/@types/team';
import { teamMembers } from '@/team/db/definitions/team';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';

export interface ITeamMemberModel extends Model<ITeamMemberDocument> {
  getTeamMember(memberId: string, teamId: string): Promise<ITeamMemberDocument>;
  createTeamMember(doc: ITeamMember): Promise<ITeamMemberDocument>;
  updateTeamMember(
    _id: string,
    role: TeamMemberRoles,
  ): Promise<ITeamMemberDocument>;

  createTeamMembers(members: ITeamMember[]): Promise<ITeamMemberDocument[]>;
  removeTeamMember(
    teamId: string,
    memberId: string,
  ): Promise<ITeamMemberDocument>;
}

export const loadTeamMemberClass = (models: IModels) => {
  class TeamMember {
    public static async getTeamMember(memberId: string, teamId: string) {
      return models.TeamMember.findOne({ memberId, teamId }).lean();
    }

    public static async createTeamMember(doc: ITeamMember) {
      return models.TeamMember.insertOne(doc);
    }

    public static async updateTeamMember(_id: string, role: TeamMemberRoles) {
      const teamMember = await models.TeamMember.findOne({ _id });

      if (!teamMember) {
        throw new Error('Team member not found');
      }

      // ** Deprecated

      // if (teamMember.role === TeamMemberRoles.ADMIN) {
      //   const adminsCount = await models.TeamMember.countDocuments({
      //     teamId: teamMember.teamId,
      //   });

      //   if (adminsCount === 1) {
      //     throw new Error('Admin cannot be removed');
      //   }
      // }

      return models.TeamMember.findOneAndUpdate({ _id }, { $set: { role } });
    }

    public static async createTeamMembers(members: ITeamMember[]) {
      return models.TeamMember.insertMany(members);
    }

    public static async removeTeamMember(teamId: string, memberId: string) {
      const teamMember = await models.TeamMember.findOne({ teamId, memberId });

      if (!teamMember) {
        throw new Error('Team member not found');
      }

      // ** Deprecated

      // if (teamMember.role === TeamMemberRoles.ADMIN) {
      //   throw new Error('Admin cannot be removed');
      // }

      return models.TeamMember.deleteOne({ teamId, memberId });
    }
  }

  teamMembers.loadClass(TeamMember);

  return teamMembers;
};
