import type { CustomValue } from '@erxes/core-contract';
import { messageOf } from '@erxes/core-contract/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ScrollArea, useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { QueryState } from '~/components/QueryState';
import { CustomFieldSections } from '~/modules/properties/CustomFieldSections';
import type { PluginPropertyType } from './pluginProperties';

/**
 * A plugin record's custom fields, as its Properties tab: core's editors on the values the
 * plugin keeps. A change goes to the plugin's `save`, then its values are read again.
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
  const { values, save } = type.properties;
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

  return (
    <ScrollArea className="flex-1 min-h-0" viewportClassName="[&>div]:block!">
      <div className="p-3">
        <QueryState query={query}>
          {(data) => (
            <CustomFieldSections
              contentType={type.type}
              scope={`plugin-record.${type.type}.${contentId}`}
              values={data}
              onSave={(patch) => edit.mutate(patch)}
            />
          )}
        </QueryState>
      </div>
    </ScrollArea>
  );
};
