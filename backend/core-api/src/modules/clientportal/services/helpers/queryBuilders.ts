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
    orConditions.push({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
  }

  if (phone) {
    orConditions.push({ phone: { $regex: new RegExp(`^${phone}$`, 'i') } });
  }

  if (orConditions.length > 0) {
    query.$or = orConditions;
  }

  return query;
}

export function buildDuplicationQuery(
  userFields: UserFields,
  idsToExclude?: string[] | string,
): DuplicationQuery {
  const query: DuplicationQuery = {
    status: { $ne: 'deleted' },
  };

  if (idsToExclude) {
    query._id = {
      $nin: Array.isArray(idsToExclude) ? idsToExclude : [idsToExclude],
    };
  }

  return query;
}
