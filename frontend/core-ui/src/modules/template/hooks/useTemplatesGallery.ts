import { useTemplates } from '@/template/hooks/useTemplates';
import { TTemplate, TTemplateGroup } from '@/template/types';
import { useQueryState } from 'erxes-ui';
import { useMemo } from 'react';

export const TEMPLATE_GROUP_ORDER: TTemplateGroup[] = [
  'solution',
  'automation',
  'segment',
];

// A section on the start page shows this many; "see all" opens the rest
const SECTION_LIMIT = 4;

const searchableTextOf = ({ name, description, parts }: TTemplate) =>
  [
    name,
    description,
    ...parts.map(({ label, name: partName }) => label || partName),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

const matchesSearch = (template: TTemplate, search: string) =>
  !search || searchableTextOf(template).includes(search.toLowerCase());

/** The gallery narrowed by `?group=`, `?plugin=` and `?q=`. */
export const useTemplatesGallery = () => {
  const { templates, loading, error } = useTemplates();
  const [group, setGroup] = useQueryState<string>('group');
  const [plugin, setPlugin] = useQueryState<string>('plugin');
  const [search, setSearch] = useQueryState<string>('q');
  const query = (search || '').trim();

  const plugins = useMemo(
    () => [...new Set(templates.map(({ pluginName }) => pluginName))].sort(),
    [templates],
  );
  const groups = useMemo(
    () =>
      TEMPLATE_GROUP_ORDER.filter((value) =>
        templates.some((template) => template.group === value),
      ),
    [templates],
  );
  const shown = templates.filter(
    (template) =>
      (!group || template.group === group) &&
      (!plugin || template.pluginName === plugin) &&
      matchesSearch(template, query),
  );

  // Nothing narrows the list: each group gets its own shelf
  const isBrowsing = !group && !plugin && !query;
  const sections = isBrowsing
    ? groups.map((value) => {
        const inGroup = templates.filter(
          (template) => template.group === value,
        );

        return {
          group: value,
          templates: inGroup.slice(0, SECTION_LIMIT),
          total: inGroup.length,
          hasMore: inGroup.length > SECTION_LIMIT,
        };
      })
    : [];

  return {
    templates: shown,
    totalCount: templates.length,
    hasTemplates: !!templates.length,
    loading,
    error,
    group: group || undefined,
    plugin: plugin || undefined,
    search: search || '',
    groups,
    plugins,
    isBrowsing,
    sections,
    setGroup: (value?: string) => setGroup(value || null),
    setPlugin: (value?: string) => setPlugin(value || null),
    setSearch: (value: string) => setSearch(value || null),
  };
};
