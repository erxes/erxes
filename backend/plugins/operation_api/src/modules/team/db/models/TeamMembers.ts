import { ITeamMember, ITeamMemberDocument } from '@/team/@types/team';
import { teamMembers } from '@/team/db/definitions/team';
import { DeleteResult } from 'mongodb';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';

export interface ITeamMemberModel extends Model<ITeamMemberDocument> {
  getTeamMember(memberId: string, teamId: string): Promise<ITeamMemberDocument>;
  createTeamMember(doc: ITeamMember): Promise<ITeamMemberDocument>;
  syncTeamMembers(teamId: string, memberIds: string[]): Promise<void>;

  createTeamMembers(members: ITeamMember[]): Promise<ITeamMemberDocument[]>;
  removeTeamMember(teamId: string, memberId: string): Promise<DeleteResult>;
}

export const loadTeamMemberClass = (models: IModels) => {
  class TeamMember {
    public static async getTeamMember(memberId: string, teamId: string) {
      return models.TeamMember.findOne({ memberId, teamId }).lean();
    }

    public static async createTeamMember(doc: ITeamMember) {
      return models.TeamMember.insertOne(doc);
    }

    public static async syncTeamMembers(teamId: string, memberIds: string[]) {
      const existing = await models.TeamMember.find({ teamId }).lean();
      const existingIds = new Set(existing.map((member) => member.memberId));
      const wantedIds = new Set(memberIds);

      const toAdd = memberIds.filter((memberId) => !existingIds.has(memberId));
      const toRemove = existing
        .map((member) => member.memberId)
        .filter((memberId) => !wantedIds.has(memberId));

      if (toAdd.length) {
        await models.TeamMember.insertMany(
          toAdd.map((memberId) => ({ memberId, teamId })),
        );
      }

      if (toRemove.length) {
        await models.TeamMember.deleteMany({
          teamId,
          memberId: { $in: toRemove },
        });
      }
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
