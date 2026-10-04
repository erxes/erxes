import { useQuery } from '@apollo/client';
import {
  FIELD_VALUE_COUNTS_QUERY,
  FIELD_VALUE_USAGE_QUERY,
} from '../graphql/queries/propertiesQueries';

export interface IFieldValueUsage {
  known: boolean;
  samples: { _id: string; label: string }[];
  dependents: string[];
}

export interface IFieldValueCounts {
  known: boolean;
  count: number;
  capped: boolean;
  byOption: { value: string; count: number }[] | null;
}

// Two queries so the quick samples never wait on a count that may scan
// every record; records may change while the sheet is open, so both re-ask.
export const useFieldValueUsage = (fieldId?: string, value?: string) => {
  const variables = { _id: fieldId, value };
  const options = {
    variables,
    skip: !fieldId,
    fetchPolicy: 'network-only' as const,
  };

  const { data, loading } = useQuery<{ fieldValueUsage: IFieldValueUsage }>(
    FIELD_VALUE_USAGE_QUERY,
    options,
  );
  const { data: countsData, loading: countsLoading } = useQuery<{
    fieldValueCounts: IFieldValueCounts;
  }>(FIELD_VALUE_COUNTS_QUERY, options);

  const usage = data?.fieldValueUsage;
  const counts = countsData?.fieldValueCounts;

  return {
    usage,
    counts,
    loading,
    countsLoading,
    // Nothing holds a value or depends on it, so any change is safe.
    unused: !!usage?.known && !usage.samples.length && !usage.dependents.length,
    // null until counted, or when the tally gave up.
    optionCount: (optionValue: string) =>
      counts?.byOption
        ? counts.byOption.find((option) => option.value === optionValue)
            ?.count ?? 0
        : null,
  };
};

export const formatUsageTotal = ({ count, capped }: IFieldValueCounts) =>
  capped ? `${count}+` : String(count);
