import { Button, Combobox, Form, Input, Popover } from 'erxes-ui';
import { SelectTagType, SelectTags } from 'ui-modules';

import { IconChevronDown } from '@tabler/icons-react';
import { TTagsForm } from '../hooks/useTagsForm';
import { useFormContext } from 'react-hook-form';

export const TagsForm = () => {
  const form = useFormContext<TTagsForm>();
  const { control, watch } = form;

  return (
    <div className="flex flex-col gap-3 py-4">
      <Form.Field
        control={control}
        name="name"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>name</Form.Label>
            <Form.Description className="sr-only">tag name</Form.Description>
            <Form.Control>
              <Input {...field} />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
      <Form.Field
        control={control}
        name="type"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>tags type</Form.Label>
            <Form.Description className="sr-only">tag type</Form.Description>
            <Form.Control>
              <SelectTagType
                value={field.value}
                onValueChange={field.onChange}
              />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
      <Form.Field
        control={control}
        name="parentId"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>parent tag</Form.Label>
            <Form.Description className="sr-only">parent tag</Form.Description>
            <Form.Control>
              <SelectTags.Provider
                tagType={watch('type') as string}
                value={field.value}
                onValueChange={field.onChange}
              >
                <Popover>
                  <Popover.Trigger asChild className="w-full">
                    <Button variant="outline">
                      {field.value ? (
                        <SelectTags.Value />
                      ) : (
                        <div className="flex items-center gap-1">
                          Select tag <IconChevronDown size={14} />
                        </div>
                      )}
                    </Button>
                  </Popover.Trigger>
                  <Combobox.Content>
                    <SelectTags.Content />
                  </Combobox.Content>
                </Popover>
              </SelectTags.Provider>
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
    </div>
  );
};
