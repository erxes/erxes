import type { PropertyContentType } from '@erxes/core-contract';
import { messageOf } from '@erxes/core-contract/client';
import { useQuery } from '@tanstack/react-query';
import { Form, MultipleSelector, type TPropertyLimit } from 'erxes-ui';
import type { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { pluginPropertyTypes } from '~/modules/plugins/pluginProperties';
import { usePluginText } from '~/modules/plugins/pluginText';
import { usePlugins } from '~/modules/plugins/usePlugins';
import type { IPropertyGroupForm, IPropertyGroupValues } from '../propertySchema';

type GroupForm = UseFormReturn<IPropertyGroupForm, unknown, IPropertyGroupValues>;

/** What a plugin type's groups can be limited to (`[]` for core's records). */
const usePropertyLimits = (contentType: PropertyContentType) => {
  const { plugins } = usePlugins();
  const type = pluginPropertyTypes(plugins).find((entry) => entry.type === contentType);

  return { plugin: type?.plugin, limits: type?.properties.limits ?? [] };
};

/** One limit: the ids picked from the plugin's choices. */
const LimitField = ({
  form,
  plugin,
  limit,
}: {
  form: GroupForm;
  plugin: string;
  limit: TPropertyLimit;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
  const text = usePluginText();
  const choices = useQuery(limit.options);
  const options = choices.data ?? [];
  const label = text(plugin, limit.label);

  return (
    <Form.Field
      control={form.control}
      name={`appliesTo.${limit.key}`}
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{label}</Form.Label>
          <Form.Control>
            <MultipleSelector
              value={(field.value ?? []).map((id) => ({
                value: id,
                label: options.find((option) => option.value === id)?.label ?? id,
              }))}
              onChange={(picked) => field.onChange(picked.map((option) => option.value))}
              options={options}
              placeholder={t('applies-to-all', 'All')}
              hidePlaceholderWhenSelected
            />
          </Form.Control>
          {choices.error && <p className="text-sm text-destructive">{messageOf(choices.error)}</p>}
          <Form.Message />
        </Form.Item>
      )}
    />
  );
};

/**
 * "Shows on": the records of a plugin type a group is limited to, as old sales limited groups to
 * boards and pipelines. A record must be in one picked id of each limit; none picked: every record.
 */
export const PropertyGroupLimits = ({
  form,
  contentType,
}: {
  form: GroupForm;
  contentType: PropertyContentType;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
  const { plugin, limits } = usePropertyLimits(contentType);

  if (!plugin || !limits.length) return null;

  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="text-sm font-medium">{t('applies-to', 'Shows on')}</p>
        <p className="text-sm text-muted-foreground">
          {t(
            'applies-to-hint',
            'Leave empty to show this group on every record. Otherwise a record must match each list.',
          )}
        </p>
      </div>
      {limits.map((limit) => (
        <LimitField key={limit.key} form={form} plugin={plugin} limit={limit} />
      ))}
    </div>
  );
};
