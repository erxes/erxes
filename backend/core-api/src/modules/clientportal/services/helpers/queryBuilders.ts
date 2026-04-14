import { escapeRegExp } from 'erxes-api-shared/utils';

export interface UserQuery {
  clientPortalId?: string;
  $or?: Array<{
    _id?: string;
    email?: { $regex: RegExp };
    phone?: { $regex: RegExp };
  }>;
}

export interface DuplicationQuery {
  status: { $ne: string };
  _id?: { $nin: string[] };
  clientPortalId?: string;
}

export interface UserFields {
  email?: string;
  phone?: string;
  userCode?: string;
}

export function buildUserQuery(
  userId?: string,
  email?: string,
  phone?: string,
  clientPortalId?: string,
): UserQuery {
  const query: UserQuery = {};

  if (clientPortalId) {
    query.clientPortalId = clientPortalId;
  }

  const orConditions: Array<{
    _id?: string;
    email?: { $regex: RegExp };
    phone?: { $regex: RegExp };
  }> = [];

  if (userId) {
    orConditions.push({ _id: userId });
  }

  if (email) {
    orConditions.push({
      email: { $regex: new RegExp(`^${escapeRegExp(email)}$`, 'i') },
    });
  }

  if (phone) {
    orConditions.push({
      phone: { $regex: new RegExp(`^${escapeRegExp(phone)}$`, 'i') },
    });
  }

  if (orConditions.length > 0) {
    query.$or = orConditions;
  }

  return query;
}

export interface CPNotificationFilterParams {
  status?: 'READ' | 'UNREAD' | 'ALL';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  type?: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  kind?: 'SYSTEM' | 'USER';
  fromDate?: string;
  endDate?: string;
  clientPortalId?: string;
}

export function buildCPNotificationQuery(
  baseQuery: Record<string, any>,
  params: CPNotificationFilterParams,
): Record<string, any> {
  const query = { ...baseQuery };

  if (params.clientPortalId) {
    query.clientPortalId = params.clientPortalId;
  }

  if (params.status && params.status !== 'ALL') {
    query.isRead = params.status === 'READ';
  }

  if (params.priority) {
    query.priority = params.priority.toLowerCase();
  }

  if (params.type) {
    query.type = params.type.toLowerCase();
  }

  if (params.kind) {
    query.kind = params.kind.toLowerCase();
  }

  if (params.fromDate || params.endDate) {
    query.createdAt = {};
    if (params.fromDate) {
      query.createdAt.$gte = new Date(params.fromDate);
    }
    if (params.endDate) {
      query.createdAt.$lte = new Date(params.endDate);
    }
  }

  return query;
}

export function buildDuplicationQuery(
  userFields: UserFields,
  idsToExclude?: string[] | string,
  clientPortalId?: string,
): DuplicationQuery {
  const query: DuplicationQuery = {
    status: { $ne: 'deleted' },
  };

  if (idsToExclude) {
    query._id = {
      $nin: Array.isArray(idsToExclude) ? idsToExclude : [idsToExclude],
    };
  }

  if (clientPortalId) {
    query.clientPortalId = clientPortalId;
  }

  return query;
}
