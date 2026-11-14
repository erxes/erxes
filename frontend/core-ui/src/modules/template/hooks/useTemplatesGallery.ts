import { useTemplates } from '@/template/hooks/useTemplates';
import { TTemplateGroup } from '@/template/types';
import { useQueryState } from 'erxes-ui';
import { useMemo } from 'react';

export const TEMPLATE_GROUP_ORDER: TTemplateGroup[] = [
  'solution',
  'automation',
  'segment',
];

/** The gallery narrowed by `?group=` and `?plugin=`. */
export const useTemplatesGallery = () => {
  const { templates, loading, error } = useTemplates();
  const [group, setGroup] = useQueryState<string>('group');
  const [plugin, setPlugin] = useQueryState<string>('plugin');

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
      (!plugin || template.pluginName === plugin),
  );

  return {
    templates: shown,
    hasTemplates: !!templates.length,
    loading,
    error,
    group: group || undefined,
    plugin: plugin || undefined,
    groups,
    plugins,
    setGroup: (value?: string) => setGroup(value || null),
    setPlugin: (value?: string) => setPlugin(value || null),
  };
};
