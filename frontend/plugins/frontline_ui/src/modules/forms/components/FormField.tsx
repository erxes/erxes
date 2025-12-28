import { IconChevronDown, IconPencil, IconTrash } from '@tabler/icons-react';
import { FORM_FIELD_TYPES } from '../constants/formFieldTypes';
import { FORM_CONTENT_SCHEMA } from '../constants/formSchema';
import { z } from 'zod';
import { Button, Collapsible, Input } from 'erxes-ui';
import { useState } from 'react';

export const ErxesFormField = ({
  field,
  remove,
}: {
  field: z.infer<typeof FORM_CONTENT_SCHEMA>['fields'][number];
  remove: () => void;
}) => {
  const fieldType = FORM_FIELD_TYPES.find((type) => type.value === field.type);

  return (
    <Collapsible>
      <div className="flex flex-col gap-2 shadow-xs p-2 rounded-lg [&_svg]:size-4 group/field">
        <div className="flex items-center gap-2 w-full ">
          {fieldType?.icon}
          {field.label}
          <Collapsible.Trigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto group-hover/field:opacity-100 transition-opacity opacity-0"
            >
              <IconChevronDown />
            </Button>
          </Collapsible.Trigger>
          <Button
            variant="ghost"
            size="icon"
            className="group-hover/field:opacity-100 transition-opacity opacity-0"
            onClick={remove}
          >
            <IconTrash />
          </Button>
        </div>
        <Collapsible.Content></Collapsible.Content>
      </div>
    </Collapsible>
  );
};

export const FieldTextSettings = () => {
  return (
    <div>
      <Input />
    </div>
  );
};
