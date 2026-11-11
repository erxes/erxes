import { ITicketDocument } from '@/ticket/@types/ticket';
import { IUserDocument } from 'erxes-api-shared/core-types';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { FilterQuery } from 'mongoose';

type TRestrictionUser = Pick<
  IUserDocument,
  '_id' | 'role' | 'isOwner' | 'departmentIds' | 'branchIds'
>;

interface ITeamMemberRestrictionConfigs {
  CHECK_TEAM_MEMBER_SHOWN?: unknown;
  BRANCHES_MASTER_TEAM_MEMBERS_IDS?: unknown;
  DEPARTMENTS_MASTER_TEAM_MEMBERS_IDS?: unknown;
}

const toIdList = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((id) => typeof id === 'string') : [];

const getStructureIdsWithChildren = async (
  subdomain: string,
  module: 'branches' | 'departments',
  ids: string[],
): Promise<string[]> => {
  if (!ids.length) {
    return [];
  }

  const records: { _id: string }[] = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module,
    action: 'findWithChild',
    input: { query: { _id: { $in: ids } }, fields: { _id: 1 } },
    defaultValue: [],
  });

  return (records || []).map(({ _id }) => _id);
};

export const buildTeamMemberRestriction = async (
  subdomain: string,
  user: TRestrictionUser,
): Promise<FilterQuery<ITicketDocument> | null> => {
  if (user.role === 'system' || user.isOwner) {
    return null;
  }

  const configs: ITeamMemberRestrictionConfigs = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'configs',
    action: 'getConfigs',
    input: {
      codes: [
        'CHECK_TEAM_MEMBER_SHOWN',
        'BRANCHES_MASTER_TEAM_MEMBERS_IDS',
        'DEPARTMENTS_MASTER_TEAM_MEMBERS_IDS',
      ],
    },
    defaultValue: {},
  });

  if (configs?.CHECK_TEAM_MEMBER_SHOWN !== true) {
    return null;
  }

  const conditions: FilterQuery<ITicketDocument>[] = [];

  if (!toIdList(configs.BRANCHES_MASTER_TEAM_MEMBERS_IDS).includes(user._id)) {
    const branchIds = await getStructureIdsWithChildren(
      subdomain,
      'branches',
      user.branchIds || [],
    );

    if (branchIds.length) {
      conditions.push({ branchId: { $in: branchIds } });
    }
  }

  if (
    !toIdList(configs.DEPARTMENTS_MASTER_TEAM_MEMBERS_IDS).includes(user._id)
  ) {
    const departmentIds = await getStructureIdsWithChildren(
      subdomain,
      'departments',
      user.departmentIds || [],
    );

    if (departmentIds.length) {
      conditions.push({ departmentId: { $in: departmentIds } });
    }
  }

  if (!conditions.length) {
    return null;
  }

  return conditions.length === 1 ? conditions[0] : { $and: conditions };
};
