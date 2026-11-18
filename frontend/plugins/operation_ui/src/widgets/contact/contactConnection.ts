import type {
  GetProjectQuery,
  UpdateProjectMutationVariables,
} from '~/gql/graphql';

type ContactRecord = Pick<
  NonNullable<GetProjectQuery['getProject']>,
  '_id' | 'customerId' | 'companyId'
>;
export type ConnectionContacts = { customerId?: string; companyId?: string };

// Only fill missing contact fields. An existing association is never replaced.
export const getContactConnectionUpdate = (
  record: ContactRecord,
  contacts: ConnectionContacts,
): Pick<
  UpdateProjectMutationVariables,
  '_id' | 'customerId' | 'companyId'
> | null => {
  const changes: ConnectionContacts = {};
  for (const field of ['customerId', 'companyId'] as const) {
    const id = contacts[field];
    if (!id) continue;
    if (record[field] && record[field] !== id) return null;
    if (!record[field]) changes[field] = id;
  }
  return Object.keys(changes).length ? { _id: record._id, ...changes } : null;
};

export const prependContactRecord = <
  T extends { _id: string },
  P extends { list: (T | null)[] | null; totalCount: number | null },
>(
  page: P,
  record: T,
  incrementCount = true,
): P => {
  const alreadyListed = page.list?.some((item) => item?._id === record._id);
  const list = [
    record,
    ...(page.list ?? []).filter((item) => item && item._id !== record._id),
  ];
  return {
    ...page,
    list,
    totalCount: Math.max(
      (page.totalCount ?? 0) + (incrementCount && !alreadyListed ? 1 : 0),
      list.length,
    ),
  };
};

export const mergeContactCandidatePages = <
  T extends { _id: string },
  P extends { list: (T | null)[] | null },
>(
  previous: P,
  next: P,
  requestedSearch: string,
  activeSearch: string | null | undefined,
): P => {
  if (requestedSearch !== activeSearch) return previous;
  const records = new Map(
    [...(previous.list ?? []), ...(next.list ?? [])]
      .filter((record) => record !== null)
      .map((record) => [record._id, record]),
  );
  return { ...next, list: [...records.values()] };
};

export const finishContactConnection = async (
  refresh: () => Promise<unknown>,
  showContact: () => void,
): Promise<boolean> => {
  try {
    await refresh();
    return true;
  } catch {
    return false;
  } finally {
    showContact();
  }
};
