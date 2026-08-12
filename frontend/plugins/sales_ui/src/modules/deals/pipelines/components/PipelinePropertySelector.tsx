import { Checkbox, Collapsible, InfoCard, Label, Spinner } from 'erxes-ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useWatch, type UseFormReturn } from 'react-hook-form';
import { useFieldGroups, useFields } from 'ui-modules';
import type { TPipelineForm } from '@/deals/types/pipelines';

const CONTENT_TYPE = 'sales:deal';
const PROPERTY_LIMIT = 100;

export const PipelinePropertySelector = ({
  form,
}: {
  form: UseFormReturn<TPipelineForm>;
}) => {
  const { t } = useTranslation('sales');
  const propertyIds =
    useWatch({ control: form.control, name: 'propertyIds' }) || [];
  const { fieldGroups, loading: groupsLoading } = useFieldGroups({
    contentType: CONTENT_TYPE,
    limit: PROPERTY_LIMIT,
  });
  const { fields, loading: fieldsLoading } = useFields({
    contentType: CONTENT_TYPE,
    limit: PROPERTY_LIMIT,
  });
  const groups = useMemo(
    () =>
      fieldGroups
        .map((group) => ({
          ...group,
          fields: fields.filter((field) => field.groupId === group._id),
        }))
        .filter((group) => group.fields.length)
        .sort((a, b) => a.order - b.order),
    [fieldGroups, fields],
  );

  const toggle = (fieldId: string, checked: boolean) => {
    form.setValue(
      'propertyIds',
      checked
        ? [...new Set([...propertyIds, fieldId])]
        : propertyIds.filter((id) => id !== fieldId),
      { shouldDirty: true },
    );
  };

  return (
    <InfoCard
      title={t('properties')}
      description={t('configure-properties-in-settings')}
    >
      <InfoCard.Content>
        {groupsLoading || fieldsLoading ? (
          <Spinner containerClassName="py-8" />
        ) : groups.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t('configure-properties-in-settings')}
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {groups.map((group) => (
              <Collapsible key={group._id} defaultOpen>
                <Collapsible.TriggerButton type="button">
                  <Collapsible.TriggerIcon className="size-3" />
                  {group.name}
                </Collapsible.TriggerButton>
                <Collapsible.Content className="grid gap-3 pt-3 pl-5 sm:grid-cols-2">
                  {group.fields.map((field) => (
                    <div key={field._id} className="flex items-center gap-2">
                      <Checkbox
                        id={`pipeline-property-${field._id}`}
                        checked={propertyIds.includes(field._id)}
                        onCheckedChange={(checked) =>
                          toggle(field._id, checked === true)
                        }
                      />
                      <Label htmlFor={`pipeline-property-${field._id}`}>
                        {field.name}
                      </Label>
                    </div>
                  ))}
                </Collapsible.Content>
              </Collapsible>
            ))}
          </div>
        )}
      </InfoCard.Content>
    </InfoCard>
  );
};
