import { Combobox, Command, Popover } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IField, IFieldGroup, useFieldGroups } from 'ui-modules';

const groupFields = (fields: IField[], groups: IFieldGroup[]) =>
  groups
    .map((group) => ({
      group,
      fields: fields.filter((field) => field.groupId === group._id),
    }))
    .filter(({ fields }) => fields.length > 0);

export const PropertyLogicFieldSelect = ({
  value,
  onValueChange,
  fields,
  contentType,
}: {
  value: string;
  onValueChange: (value: string) => void;
  fields: IField[];
  contentType: string;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
  const [open, setOpen] = useState(false);
  const { fieldGroups } = useFieldGroups({ contentType });

  const selected = fields.find((field) => field._id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Combobox.Trigger className="flex-1 shadow-xs">
        {selected ? (
          <span className="truncate">{selected.name}</span>
        ) : (
          <Combobox.Value
            placeholder={t('select-property', 'Select property')}
          />
        )}
      </Combobox.Trigger>
      <Combobox.Content>
        <Command>
          <Command.Input
            placeholder={t('search-property', 'Search property')}
            focusOnMount
          />
          <Command.List>
            <Command.Empty>
              {t('no-fields-found', 'No fields found')}
            </Command.Empty>
            {groupFields(fields, fieldGroups).map(({ group, fields }) => (
              <Command.Group key={group._id} heading={group.name}>
                {fields.map((field) => (
                  <Command.Item
                    key={field._id}
                    // Searching by group name finds every field in it.
                    value={`${field.name} ${group.name} ${field._id}`}
                    onSelect={() => {
                      onValueChange(field._id);
                      setOpen(false);
                    }}
                  >
                    <span className="truncate">{field.name}</span>
                    <Combobox.Check checked={field._id === value} />
                  </Command.Item>
                ))}
              </Command.Group>
            ))}
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};
