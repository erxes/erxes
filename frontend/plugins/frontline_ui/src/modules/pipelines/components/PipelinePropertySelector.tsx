import { Checkbox, Label, Spinner } from 'erxes-ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useFieldGroups, useFields } from 'ui-modules';

const CONTENT_TYPE = 'frontline:ticket';
const PROPERTY_LIMIT = 100;

type Props = {
  value: string[];
  onChange: (propertyIds: string[]) => void;
};

export const PipelinePropertySelector = ({ value, onChange }: Props) => {
  const { t } = useTranslation('frontline');
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

  if (groupsLoading || fieldsLoading) {
    return <Spinner containerClassName="py-8" />;
  }

  if (!groups.length) {
    return (
      <p className="text-sm text-muted-foreground">
        {t('no-ticket-property-fields')}
      </p>
    );
  }

  const toggleGroup = (fieldIds: string[], checked: boolean) => {
    const groupFieldIds = new Set(fieldIds);

    onChange(
      checked
        ? [...new Set([...value, ...fieldIds])]
        : value.filter((id) => !groupFieldIds.has(id)),
    );
  };

  return (
    <div className="flex flex-col gap-3">
      {groups.map((group) => {
        const fieldIds = group.fields.map((field) => field._id);
        const selectedCount = fieldIds.filter((id) =>
          value.includes(id),
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
  );
};
