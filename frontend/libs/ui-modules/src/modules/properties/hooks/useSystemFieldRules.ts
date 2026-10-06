import { useQuery } from '@apollo/client';
import { useMemo } from 'react';
import { PROPERTY_SYSTEM_FIELD_RULES_QUERY } from '../graphql/systemFieldRulesQueries';

interface ISystemFieldRule {
  code: string;
  isVisible: boolean;
  isVisibleToCreate: boolean;
  isRequired: boolean;
  requiredGroup?: string | null;
}

export interface ISystemFieldRules {
  isShown: (code: string) => boolean;
  isRequired: (code: string) => boolean;
  // Per group, the codes on the form; at least one of each must be filled.
  groups: string[][];
}

export type TSystemFieldFormMode = 'create' | 'detail';

const buildRules = (
  fields: ISystemFieldRule[],
  mode: TSystemFieldFormMode,
): ISystemFieldRules => {
  const byCode = new Map(fields.map((field) => [field.code, field]));
  const isShown = (code: string) => {
    const field = byCode.get(code);

    return !!(mode === 'create' ? field?.isVisibleToCreate : field?.isVisible);
  };

  // Records made elsewhere may lack all of a group; editing them stays possible.
  const groups = new Map<string, string[]>();

  if (mode === 'create') {
    for (const field of fields) {
      if (field.requiredGroup && isShown(field.code)) {
        groups.set(field.requiredGroup, [
          ...(groups.get(field.requiredGroup) ?? []),
          field.code,
        ]);
      }
    }
  }

  return {
    isShown,
    isRequired: (code) => !!byCode.get(code)?.isRequired,
    groups: [...groups.values()],
  };
};

// What a form shows and requires, from Settings → Properties → Basic information.
export const useSystemFieldRules = (
  contentType: string,
  mode: TSystemFieldFormMode,
) => {
  const { data, loading } = useQuery<{
    propertySystemFields: ISystemFieldRule[];
  }>(PROPERTY_SYSTEM_FIELD_RULES_QUERY, {
    variables: { contentType },
    fetchPolicy: 'cache-and-network',
  });

  const rules = useMemo(
    () => buildRules(data?.propertySystemFields ?? [], mode),
    [data, mode],
  );

  return { rules, loading: loading && !data };
};
