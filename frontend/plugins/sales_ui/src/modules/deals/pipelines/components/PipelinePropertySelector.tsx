import { Checkbox, InfoCard, Label, Spinner } from 'erxes-ui';
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

  const toggleGroup = (fieldIds: string[], checked: boolean) => {
    const groupFieldIds = new Set(fieldIds);

    form.setValue(
      'propertyIds',
      checked
        ? [...new Set([...propertyIds, ...fieldIds])]
        : propertyIds.filter((id) => !groupFieldIds.has(id)),
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
            {groups.map((group) => {
              const fieldIds = group.fields.map((field) => field._id);
              const selectedCount = fieldIds.filter((id) =>
                propertyIds.includes(id),
              ).length;
              const checked =
                selectedCount === fieldIds.length
                  ? true
                  : selectedCount > 0
                  ? 'indeterminate'
                  : false;

              return (
                <div
                  key={group._id}
                  className="flex items-center gap-3 rounded-md border p-3"
                >
                  <Checkbox
                    id={`pipeline-property-group-${group._id}`}
                    checked={checked}
                    onCheckedChange={(nextChecked) =>
                      toggleGroup(fieldIds, nextChecked === true)
                    }
                  />
                  <Label
                    htmlFor={`pipeline-property-group-${group._id}`}
                    className="flex min-w-0 flex-1 items-center justify-between gap-3"
                  >
                    <span className="truncate">{group.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {group.fields.length}
                    </span>
                  </Label>
                </div>
              );
            })}
          </div>
        )}
      </InfoCard.Content>
    </InfoCard>
  );
};
