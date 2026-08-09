import { FIELD_GROUPS_QUERY } from '../graphql/fieldsQueries';
import { IFieldGroup } from '../types/fieldsTypes';
import { useAllCursorPages } from './useAllCursorPages';

const FIELD_GROUPS_PER_PAGE = 100;

export const useFieldGroups = ({
  contentType,
  limit,
}: {
  contentType: string;
  limit?: number;
}) => {
  const { list, loading, error, refetch } = useAllCursorPages<IFieldGroup>({
    query: FIELD_GROUPS_QUERY,
    responseKey: 'fieldGroups',
    params: { contentType },
    perPage: FIELD_GROUPS_PER_PAGE,
    limit,
  });

  return {
    fieldGroups: list,
    loading,
    error,
    refetch,
  };
};
