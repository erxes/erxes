import { useQuery } from '@apollo/client';
import { FIELDS_QUERY } from '../graphql/fieldsQueries';
import { ICursorListResponse } from 'erxes-ui';
import { IField } from '../types/fieldsTypes';

export const useFields = ({
  groupId,
  contentType,
  limit,
}: {
  groupId?: string;
  contentType: string;
  limit?: number;
}) => {
  const { data, loading, refetch } = useQuery<ICursorListResponse<IField>>(
    FIELDS_QUERY,
    {
      variables: {
        params: {
          groupId,
          contentType,
          limit,
        },
      },
    },
  );

  const fields = (data?.fields?.list || []).map((field) => {
    const type = field.type?.startsWith('relation:') ? 'relation' : field.type;
    const relationType =
      type === 'relation' ? field.type?.replace('relation:', '') : undefined;

    const logics = Object.fromEntries(
      Object.entries(field.logics || {}).filter(([key]) => key !== 'multiple'),
    );

    const multiple = field.logics?.multiple;

    return {
      ...field,
      type,
      relationType,
      logics,
      multiple,
    };
  });

  return {
    fields: fields,
    loading,
    refetch,
  };
};
