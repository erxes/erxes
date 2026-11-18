import { useUnitNames } from '~/modules/settings/structure/UnitPicker';
import { useTags } from '~/modules/tags/useTags';

/** Contact tags as picker options, and the names of `unitIds` and of tags by id. */
export const useKeyLookups = (unitIds: string[] = []) => {
  const customerTags = useTags('customer');
  const companyTags = useTags('company');
  const unitNames = useUnitNames(unitIds);

  const tags = [...customerTags.tags, ...companyTags.tags].map((tag) => ({
    value: tag.id,
    label: tag.name,
  }));

  const names = new Map([
    ...unitNames,
    ...tags.map((tag): [string, string] => [tag.value, tag.label]),
  ]);

  return {
    tags: { options: tags, loading: false, error: null },
    nameOf: (id: string) => names.get(id) ?? id,
  };
};
