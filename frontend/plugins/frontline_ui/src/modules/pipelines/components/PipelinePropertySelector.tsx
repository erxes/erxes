import { Checkbox, Collapsible, Label, Spinner } from 'erxes-ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IField, useFieldGroups, useFields } from 'ui-modules';

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

  const toggle = (field: IField, checked: boolean) => {
    onChange(
      checked
        ? [...new Set([...value, field._id])]
        : value.filter((id) => id !== field._id),
    );
  };

  return (
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
                  checked={value.includes(field._id)}
                  onCheckedChange={(checked) => toggle(field, checked === true)}
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
  );
};
