import { COMPANIES_RECORD_TABLE_ADD } from '@/contacts/companies/graphql/mutations/addCompanyToRecordTable';
import {
  isReference,
  Reference,
  StoreObject,
  useMutation,
} from '@apollo/client';
import { toast } from 'erxes-ui';

// Arguments that only page or order a list; any other one filters it.
const LIST_ONLY_ARGS = new Set([
  'cursorMode',
  'direction',
  'limit',
  'sortField',
  'sortDirection',
  'orderBy',
]);

const isEmpty = (value: unknown) =>
  value === undefined ||
  value === null ||
  value === '' ||
  (Array.isArray(value) && value.length === 0);

// Date filters are always sent, as ranges that are empty when unset.
const isEmptyDateFilter = (dateFilters: unknown) => {
  if (typeof dateFilters !== 'string') {
    return isEmpty(dateFilters);
  }

  try {
    const ranges = JSON.parse(dateFilters) as Record<string, object>;
    return Object.values(ranges).every(
      (range) => !range || Object.keys(range).length === 0,
    );
  } catch {
    return false;
  }
};

// A blank company belongs at the top of an unfiltered first page.
const showsNewRecord = (storeFieldName: string) => {
  const start = storeFieldName.indexOf('(');

  if (start === -1) {
    return true;
  }

  try {
    const args = JSON.parse(storeFieldName.slice(start + 1, -1)) as Record<
      string,
      unknown
    >;

    return Object.entries(args).every(([name, value]) => {
      if (LIST_ONLY_ARGS.has(name)) {
        return true;
      }

      return name === 'dateFilters' ? isEmptyDateFilter(value) : isEmpty(value);
    });
  } catch {
    return false;
  }
};

type TCompaniesList = {
  list?: Reference[];
  totalCount?: number;
};

/**
 * Creates a company from its side panel draft and puts it at the top of
 * the table from the cache; nothing is refetched.
 */
export const useCreateCompanyRecord = () => {
  // The row as stored in the cache; only `_id` is read here.
  const [mutate, { loading }] = useMutation<{
    companiesAdd: StoreObject & { _id: string };
  }>(COMPANIES_RECORD_TABLE_ADD);

  const createCompanyRecord = (values: Record<string, string> = {}) =>
    mutate({
      variables: values,
      update: (cache, { data }) => {
        const created = data?.companiesAdd;

        if (!created) {
          return;
        }

        cache.modify<{ companies: TCompaniesList }>({
          fields: {
            companies(existing, { storeFieldName, toReference }) {
              if (
                !existing ||
                isReference(existing) ||
                !existing.list ||
                !showsNewRecord(storeFieldName)
              ) {
                return existing;
              }

              const ref = toReference(created, true);

              if (!ref) {
                return existing;
              }

              return {
                ...existing,
                list: [ref, ...existing.list],
                totalCount: (existing.totalCount || 0) + 1,
              };
            },
          },
        });
      },
      onError: (e) =>
        toast({
          title: 'Error',
          description: e.message,
          variant: 'destructive',
        }),
    });

  return { createCompanyRecord, loading };
};
