import { FilterQuery } from 'mongoose';
import { IUserDocument } from '../../core-types';
import { getStructureUserContext, PERMISSION_SCOPES } from './scope';

const UNRESTRICTED_VALUES = [null, '', []];

export type TContainerScope =
  (typeof PERMISSION_SCOPES)[keyof typeof PERMISSION_SCOPES];

export interface IContainerAccessRule {
  scope?: TContainerScope;
  exemptUserIds?: string[];
}

export const getSharedWithFilter = async (
  subdomain: string,
  user: IUserDocument,
  field = 'sharedEntityIds',
): Promise<FilterQuery<unknown>> => {
  if (user.isOwner) {
    return {};
  }

  const { principalEntityIds } = await getStructureUserContext(
    subdomain,
    user._id,
  );

  return {
    $or: [
      { [field]: { $in: UNRESTRICTED_VALUES } },
      { [field]: { $in: principalEntityIds } },
    ],
  };
};

export const getContainerScopeFilter = async ({
  subdomain,
  user,
  rule,
  ownerFields,
  entityField,
}: {
  subdomain: string;
  user: IUserDocument;
  rule?: IContainerAccessRule;
  ownerFields: string[];
  entityField?: string;
}): Promise<FilterQuery<unknown>> => {
  if (
    !rule?.scope ||
    user.isOwner ||
    (rule.exemptUserIds || []).includes(user._id)
  ) {
    return {};
  }

  if (rule.scope === PERMISSION_SCOPES.SELF) {
    return { $or: ownerFields.map((field) => ({ [field]: user._id })) };
  }

  const { boundaryEntityIds, boundaryUserIds } = await getStructureUserContext(
    subdomain,
    user._id,
  );
  const userIds = [...new Set([...boundaryUserIds, user._id])];
  const conditions: FilterQuery<unknown>[] = ownerFields.map((field) => ({
    [field]: { $in: userIds },
  }));

  if (entityField) {
    conditions.push({ [entityField]: { $in: boundaryEntityIds } });
  }

  return { $or: conditions };
};
