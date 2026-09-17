import { useQuery } from '@apollo/client';
import { FIELD_OPTION_USED_VALUES_QUERY } from 'ui-modules';

export const useFieldOptionUsedValues = ({ fieldId }: { fieldId?: string }) => {
  const { data, loading } = useQuery(FIELD_OPTION_USED_VALUES_QUERY, {
    variables: { fieldId },
    skip: !fieldId,
  });

  const usedValues: string[] | null = data?.fieldOptionUsedValues ?? null;

  return { usedValues, loading };
};
