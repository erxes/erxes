import { useQuery } from '@apollo/client';
import { FIELD_OPTION_USED_VALUES_QUERY } from 'ui-modules';

interface IFieldOptionUsage {
  value: string;
  count: number;
}

export const useFieldOptionUsedValues = ({ fieldId }: { fieldId?: string }) => {
  const { data, loading } = useQuery<{
    fieldOptionUsedValues: IFieldOptionUsage[] | null;
  }>(FIELD_OPTION_USED_VALUES_QUERY, {
    variables: { fieldId },
    skip: !fieldId,
  });

  const usage = data?.fieldOptionUsedValues ?? null;

  const usageByValue: Map<string, number> | null = usage
    ? new Map(usage.map(({ value, count }) => [value, count]))
    : null;

  return { usageByValue, loading };
};
