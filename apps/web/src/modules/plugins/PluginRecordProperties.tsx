import type { AppliesTo, CustomValue } from '@erxes/core-contract';
import { messageOf } from '@erxes/core-contract/client';
import { type UseQueryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ScrollArea, useToast } from 'erxes-ui';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { QueryState } from '~/components/QueryState';
import { CustomFieldSections } from '~/modules/properties/CustomFieldSections';
import type { PluginPropertyType } from './pluginProperties';

/** What the record is in, read before its groups show. */
const WithAppliesTo = ({
  options,
  children,
}: {
  options: UseQueryOptions<AppliesTo>;
  children: (appliesTo: AppliesTo) => ReactNode;
}) => {
  const query = useQuery(options);

  return <QueryState query={query}>{children}</QueryState>;
};

/**
 * A plugin record's custom fields, as its Properties tab: core's editors on the values the
 * plugin keeps. A change goes to the plugin's `save`, then its values are read again. A type
 * with `limits` shows only the groups that apply to the record.
 */
export const PluginRecordProperties = ({
  type,
  contentId,
}: {
  type: PluginPropertyType;
  contentId: string;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'side-panel' });
  const { toast } = useToast();
  const client = useQueryClient();
  const { values, save, appliesTo } = type.properties;
  const query = useQuery(values(contentId));

  const edit = useMutation({
    mutationFn: (patch: Record<string, CustomValue | null>) => save(contentId, patch),
    onSettled: () => client.invalidateQueries({ queryKey: values(contentId).queryKey }),
    onError: (error) =>
      toast({
        variant: 'destructive',
        title: t('properties-not-saved', 'Could not save the property'),
        description: messageOf(error),
      }),
  });

  const sections = (data: Record<string, CustomValue>, record?: AppliesTo) => (
    <CustomFieldSections
      contentType={type.type}
      scope={`plugin-record.${type.type}.${contentId}`}
      values={data}
      appliesTo={record}
      onSave={(patch) => edit.mutate(patch)}
    />
  );

  return (
    <ScrollArea className="flex-1 min-h-0" viewportClassName="[&>div]:block!">
      <div className="p-3">
        <QueryState query={query}>
          {(data) =>
            appliesTo ? (
              <WithAppliesTo options={appliesTo(contentId)}>
                {(record) => sections(data, record)}
              </WithAppliesTo>
            ) : (
              sections(data)
            )
          }
        </QueryState>
      </div>
    </ScrollArea>
  );
};
