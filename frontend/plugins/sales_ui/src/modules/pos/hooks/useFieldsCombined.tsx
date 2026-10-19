import { queries } from '@/pos/graphql/queries';
import { useQuery } from '@apollo/client';
import { useMemo } from 'react';
import { z } from 'zod';
import type { FieldsCombinedByContentTypeQueryVariables } from '~/gql/graphql';

const fieldSchema = z.array(
  z
    .object({ label: z.string(), name: z.string(), type: z.string().nullish() })
    .passthrough(),
);

export const useFieldsCombined = ({
  contentType,
  usageType,
  excludedNames,
  segmentId,
  config,
  onlyDates,
}: FieldsCombinedByContentTypeQueryVariables) => {
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

  const parsed = useMemo(
    () => fieldSchema.safeParse(data?.fieldsCombinedByContentType ?? []),
    [data?.fieldsCombinedByContentType],
  );
  const fields = parsed.success ? parsed.data : [];

  return {
    fields,
    loading,
    error: error ?? (parsed.success ? undefined : parsed.error),
  };
};
