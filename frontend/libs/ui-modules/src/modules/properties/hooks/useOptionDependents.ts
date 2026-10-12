import { useQuery } from '@apollo/client';
import { FIELD_OPTION_DEPENDENTS_QUERY } from '../graphql/propertyFormQueries';

export interface IOptionDependents {
  logics: string[];
  segments: string[];
}

export const useOptionDependents = (fieldId?: string, value?: string) => {
  const { data, loading } = useQuery<{
    fieldOptionDependents: IOptionDependents;
  }>(FIELD_OPTION_DEPENDENTS_QUERY, {
    variables: { _id: fieldId, value },
    skip: !fieldId || !value,
    fetchPolicy: 'network-only',
  });

  return { dependents: data?.fieldOptionDependents, loading };
};
