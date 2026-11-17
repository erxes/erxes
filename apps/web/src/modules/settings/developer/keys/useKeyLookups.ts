import { useMemo } from 'react';
import { useUnits } from '~/modules/settings/structure/useUnits';
import { useTags } from '~/modules/tags/useTags';

interface Option {
  value: string;
  label: string;
}

/** Branches and departments, and contact tags, as picker options and names by id. */
export const useKeyLookups = () => {
  const branches = useUnits('branch');
  const departments = useUnits('department');
  const customerTags = useTags('customer');
  const companyTags = useTags('company');

  return useMemo(() => {
    const units: Option[] = [...(branches.data?.data ?? []), ...(departments.data?.data ?? [])].map(
      (unit) => ({ value: unit.id, label: unit.name }),
    );

    const tags: Option[] = [...customerTags.tags, ...companyTags.tags].map((tag) => ({
      value: tag.id,
      label: tag.name,
    }));

    const names = new Map([...units, ...tags].map((option) => [option.value, option.label]));

    return {
      units: {
        options: units,
        loading: branches.isLoading || departments.isLoading,
        error: branches.error ?? departments.error,
      },
      tags: { options: tags, loading: false, error: null },
      nameOf: (id: string) => names.get(id) ?? id,
    };
  }, [
    branches.data,
    branches.isLoading,
    branches.error,
    departments.data,
    departments.isLoading,
    departments.error,
    customerTags.tags,
    companyTags.tags,
  ]);
};
