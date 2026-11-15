import type { TListFilterProps } from 'erxes-ui';
import type { ListField } from '../useViews';
import { ListFilterFrame } from './ListFilterBar';

/**
 * A plugin list's filter bar (erxes-ui's `ListFilter`): core's bar on the fields the plugin
 * gives. Its rules use the fields' paths; the plugin's API applies them.
 */
export const PluginListFilter = ({
  id,
  fields,
  totalCount,
  totalCapped,
  children,
}: TListFilterProps) => {
  const listFields = fields.map(({ options, ...field }): ListField => ({
    ...field,
    options: options?.map((option) => option.value),
    group: 'fields',
  }));

  const optionLabel = (path: string, value: string) =>
    fields.find((field) => field.path === path)?.options?.find((option) => option.value === value)
      ?.label ?? value;

  return (
    <ListFilterFrame
      id={id}
      fields={listFields}
      fieldsLoading={false}
      fieldsError={null}
      subject={null}
      optionLabel={optionLabel}
      totalCount={totalCount}
      totalCapped={totalCapped ?? false}
    >
      {children}
    </ListFilterFrame>
  );
};
