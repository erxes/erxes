import { useQuery } from '@apollo/client';
import { useMemo } from 'react';
import { PROPERTY_CREATE_FIELD_RULES_QUERY } from '../graphql/createFieldRulesQueries';

interface ICreateFieldRule {
  code: string;
  isVisibleToCreate: boolean;
  isRequired: boolean;
  requiredGroup?: string | null;
}

export interface ICreateFieldRules {
  isShown: (code: string) => boolean;
  isRequired: (code: string) => boolean;
  // Per group, the codes on the form; at least one of each must be filled.
  groups: string[][];
}

const buildRules = (fields: ICreateFieldRule[]): ICreateFieldRules => {
  const byCode = new Map(fields.map((field) => [field.code, field]));
  const groups = new Map<string, string[]>();

  for (const field of fields) {
    if (field.requiredGroup && field.isVisibleToCreate) {
      groups.set(field.requiredGroup, [
        ...(groups.get(field.requiredGroup) ?? []),
        field.code,
      ]);
    }
  }

  return {
    isShown: (code) => !!byCode.get(code)?.isVisibleToCreate,
    isRequired: (code) => !!byCode.get(code)?.isRequired,
    groups: [...groups.values()],
  };
};

// What a create form shows and requires, from Settings → Properties → Basic information.
export const useCreateFieldRules = (contentType: string) => {
  const { data, loading } = useQuery<{
    propertySystemFields: ICreateFieldRule[];
  }>(PROPERTY_CREATE_FIELD_RULES_QUERY, {
    variables: { contentType },
    fetchPolicy: 'cache-and-network',
  });

  const rules = useMemo(
    () => buildRules(data?.propertySystemFields ?? []),
    [data],
  );

  return { rules, loading: loading && !data };
};
