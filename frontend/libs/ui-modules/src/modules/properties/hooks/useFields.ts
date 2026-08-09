import { FIELDS_QUERY } from '../graphql/fieldsQueries';
import { IField } from '../types/fieldsTypes';
import { useAllCursorPages } from './useAllCursorPages';

const FIELDS_PER_PAGE = 100;

export const useFields = ({
  groupId,
  contentType,
  limit,
}: {
  groupId?: string;
  contentType: string;
  limit?: number;
}) => {
  const { list, totalCount, loading, error, refetch } =
    useAllCursorPages<IField>({
      query: FIELDS_QUERY,
      responseKey: 'fields',
      params: { groupId, contentType },
      perPage: FIELDS_PER_PAGE,
      limit,
    });

  const fields = list.map((field) => {
    const type = field.type?.startsWith('relation:') ? 'relation' : field.type;
    const relationType =
      type === 'relation' ? field.type?.replace('relation:', '') : undefined;

    const isLogicRules = Array.isArray(field.logics);

    const logics = isLogicRules
      ? field.logics
      : Object.fromEntries(
          Object.entries(field.logics || {}).filter(
            ([key]) => key !== 'multiple',
          ),
        );

    const multiple = isLogicRules
      ? undefined
      : (field.logics as { multiple?: boolean } | undefined)?.multiple;

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
    totalCount,
    loading,
    error,
    refetch,
  };
};
