import { Form, IconPicker, Input, Select, Textarea } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { IPropertyForm } from '../types/Properties';
import { zodResolver } from '@hookform/resolvers/zod';
import { propertySchema } from '../propertySchema';
import {
  IconCalendarEvent,
  IconCheck,
  IconFile,
  IconNumbers,
  IconRelationManyToMany,
  IconTag,
  IconTextSize,
} from '@tabler/icons-react';
import { PropertyFormValidation } from './PropertyFormValidations';
import { PropertyFormSelectFields } from './PropertyFormSelectFields';
import { PropertySelectRelationType } from './PropertySelectRelationType';

export const PropertyForm = () => {
  const form = useForm<IPropertyForm>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      icon: '',
      name: '',
      description: '',
      code: '',
      groupId: '',
      type: '',
    },
  });

  const onSubmit = (data: IPropertyForm) => {
    console.log(data);
  };

  return (
    <Form {...form}>
      <form
        className="w-full flex flex-col gap-5"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className="flex gap-5">
          <Form.Field
            name="icon"
            render={({ field }) => (
              <Form.Item className="flex-none">
                <Form.Label>Icon</Form.Label>
                <Form.Control>
                  <IconPicker
                    onValueChange={field.onChange}
                    value={field.value}
                    variant="outline"
                    size="icon"
                  />
                </Form.Control>
              </Form.Item>
            )}
          />
          <Form.Field
            name="name"
            render={({ field }) => (
              <Form.Item className="flex-auto">
                <Form.Label>Name</Form.Label>
                <Form.Control>
                  <Input {...field} />
                </Form.Control>
              </Form.Item>
            )}
          />
        </div>
        <Form.Field
          name="code"
          render={({ field }) => (
            <Form.Item className="flex-auto">
              <Form.Label>Code</Form.Label>
              <Form.Control>
                <Input {...field} />
              </Form.Control>
            </Form.Item>
          )}
        />
        <Form.Field
          name="description"
          render={({ field }) => (
            <Form.Item className="flex-auto">
              <Form.Label>Description</Form.Label>
              <Form.Control>
                <Textarea {...field} />
              </Form.Control>
            </Form.Item>
          )}
        />
        <Form.Field
          name="type"
          render={({ field }) => (
            <Form.Item className="flex-auto">
              <Form.Label>Type</Form.Label>

              <Select value={field.value} onValueChange={field.onChange}>
                <Form.Control>
                  <Select.Trigger>
                    <Select.Value placeholder="Select type" />
                  </Select.Trigger>
                </Form.Control>
                <Select.Content>
                  {FIELD_TYPES.map((type) => (
                    <Select.Item key={type.value} value={type.value}>
                      <div className="flex items-center gap-2 [&_svg]:size-4">
                        {type.icon}
                        {type.label}
                      </div>
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </Form.Item>
          )}
        />
        <PropertyFormValidation form={form} />
        <PropertyFormSelectFields form={form} />
        <PropertySelectRelationType form={form} />
      </form>
    </Form>
  );
};

const FIELD_TYPES = [
  { value: 'text', label: 'Text', icon: <IconTextSize /> },
  { value: 'number', label: 'Number', icon: <IconNumbers /> },
  { value: 'boolean', label: 'True/False', icon: <IconCheck /> },
  { value: 'date', label: 'Date', icon: <IconCalendarEvent /> },
  { value: 'select', label: 'Select', icon: <IconTag /> },
  { value: 'relation', label: 'Relation', icon: <IconRelationManyToMany /> },
  { value: 'file', label: 'File', icon: <IconFile /> },
];
