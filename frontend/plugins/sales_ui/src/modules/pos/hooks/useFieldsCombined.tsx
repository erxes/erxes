import { useQuery } from '@apollo/client';
import queries from '@/pos/graphql/queries';

interface Field {
  label: string;
  name: string;
  type?: string;
}

interface UseFieldsCombinedProps {
  contentType: string;
  usageType?: string;
  excludedNames?: string[];
  segmentId?: string;
  config?: any;
  onlyDates?: boolean;
}

export const useFieldsCombined = ({
  contentType,
  usageType,
  excludedNames,
  segmentId,
  config,
  onlyDates,
}: UseFieldsCombinedProps) => {
  const { data, loading, error } = useQuery(
    queries.fieldsCombinedByContentType,
    {
      variables: {
        contentType,
        usageType,
        excludedNames,
        segmentId,
        config,
        onlyDates,
      },
      skip: !contentType,
    },
  );

  const fields: Field[] = data?.fieldsCombinedByContentType || [];

  return {
    fields,
    loading,
    error,
  };
};
