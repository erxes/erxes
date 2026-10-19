import { CUSTOMERS_RECORD_TABLE_ADD } from '@/contacts/customers/graphql/mutations/addCustomerToRecordTable';
import {
  isReference,
  Reference,
  StoreObject,
  useMutation,
} from '@apollo/client';
import { toast } from 'erxes-ui';

type TState = 'customer' | 'lead';

// The arguments a cached `customers(...)` list was fetched with.
const parseListArgs = (storeFieldName: string) => {
  const start = storeFieldName.indexOf('(');

  if (start === -1) {
    return {};
  }

  try {
    return JSON.parse(storeFieldName.slice(start + 1, -1)) as Record<
      string,
      unknown
    >;
  } catch {
    return null;
  }
};

const isEmpty = (value: unknown) =>
  value === undefined ||
  value === null ||
  value === '' ||
  (Array.isArray(value) && value.length === 0);

// Date filters are always sent, as ranges that are empty when unset.
const hasDateFilter = (dateFilters: unknown) => {
  if (typeof dateFilters !== 'string') {
    return false;
  }

  try {
    const ranges = JSON.parse(dateFilters) as Record<string, object>;
    return Object.values(ranges).some(
      (range) => range && Object.keys(range).length > 0,
    );
  } catch {
    return true;
  }
};

const FILTER_ARGS = [
  'searchValue',
  'tagIds',
  'segment',
  'segmentIds',
  'brandIds',
  'integrationIds',
  'formIds',
  'propertiesData',
  'leadStatus',
  'emailValidationStatus',
  'startDate',
  'endDate',
];

// A blank record belongs at the top of an unfiltered first page of its list.
const showsNewRecord = (storeFieldName: string, state: TState) => {
  const args = parseListArgs(storeFieldName);

  return (
    !!args &&
    isEmpty(args.cursor) &&
    (isEmpty(args.type) || args.type === state) &&
    FILTER_ARGS.every((name) => isEmpty(args[name])) &&
    !hasDateFilter(args.dateFilters)
  );
};

type TCustomersList = {
  list?: Reference[];
  totalCount?: number;
};

/**
 * Creates an empty customer or lead and puts it at the top of the table
 * from the cache; nothing is refetched.
 */
export const useCreateCustomerRecord = () => {
  // The row as stored in the cache; only `_id` is read here.
  const [mutate, { loading }] = useMutation<{
    customersAdd: StoreObject & { _id: string };
  }>(CUSTOMERS_RECORD_TABLE_ADD);

  const createCustomerRecord = (state: TState) =>
    mutate({
      variables: { state },
      update: (cache, { data }) => {
        const created = data?.customersAdd;

        if (!created) {
          return;
        }

        cache.modify<{ customers: TCustomersList }>({
          fields: {
            customers(existing, { storeFieldName, toReference }) {
              if (
                !existing ||
                isReference(existing) ||
                !existing.list ||
                !showsNewRecord(storeFieldName, state)
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

  return { createCustomerRecord, loading };
};
