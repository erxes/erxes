import { useAtom } from 'jotai';
import { formSetupContentAtom } from '../states/formSetupStates';
import { FormMutateLayout } from './FormMutateLayout';
import { FORM_CONTENT_SCHEMA } from '../constants/formSchema';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, DropdownMenu, InfoCard } from 'erxes-ui';
import { IconPlus } from '@tabler/icons-react';
import { FORM_FIELD_TYPES } from '../constants/formFieldTypes';
import { ErxesFormField } from './FormField';

export const FormContent = () => {
  const [content, setContent] = useAtom(formSetupContentAtom);
  const form = useForm<z.infer<typeof FORM_CONTENT_SCHEMA>>({
    resolver: zodResolver(FORM_CONTENT_SCHEMA),
    defaultValues: content,
  });

  const onSubmit = (values: z.infer<typeof FORM_CONTENT_SCHEMA>) => {
    setContent(values);
  };

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'fields',
  });

  return (
    <FormMutateLayout
      title="Content"
      description="Content"
      form={form}
      onSubmit={onSubmit}
    >
      <InfoCard title="Fields">
        <InfoCard.Content>
          <div className="grid grid-cols-2 gap-4">
            {fields.map((field, index) => (
              <ErxesFormField
                key={field.id}
                field={field}
                remove={() => remove(index)}
              />
            ))}
          </div>
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenu.Trigger asChild>
                <Button variant="secondary">
                  <IconPlus /> Add field
                </Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content>
                {FORM_FIELD_TYPES.map((type) => (
                  <DropdownMenu.Item
                    key={type.value}
                    onClick={() => {
                      append({
                        type: type.value,
                        label: type.label,
                        placeholder: '',
                        description: '',
                        required: false,
                        options: [],
                      });
                    }}
                  >
                    {type.icon}
                    {type.label}
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.Content>
            </DropdownMenu>
          </div>
        </InfoCard.Content>
      </InfoCard>
    </FormMutateLayout>
  );
};
