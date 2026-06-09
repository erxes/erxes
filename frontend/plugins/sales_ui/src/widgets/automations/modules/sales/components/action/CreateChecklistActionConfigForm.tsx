import { zodResolver } from '@hookform/resolvers/zod';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { Button, Checkbox, Form } from 'erxes-ui';
import { useFieldArray, useForm } from 'react-hook-form';
import {
  AutomationActionFormProps,
  PlaceholderInput,
  useAutomationRemoteFormSubmit,
  useFormValidationErrorHandler,
} from 'ui-modules';
import {
  checklistActionConfigFormSchema,
  TChecklistActionConfigForm,
} from '../../states/checklistActionConfigFormDefinitions';
import { TSalesActionConfigForm } from '../../states/salesActionConfigFormDefinitions';

type TSalesAutomationActionConfigForm =
  | TSalesActionConfigForm
  | TChecklistActionConfigForm;

const createChecklistItemId = () =>
  `checklist-item-${Date.now()}-${Math.round(Math.random() * 100000)}`;

const getDefaultValues = (
  config?: TSalesAutomationActionConfigForm,
): TChecklistActionConfigForm => ({
  name: config?.name || '',
  items:
    config && 'items' in config && config.items?.length ? config.items : [],
});

export const CreateChecklistActionConfigForm = ({
  formRef,
  onSaveActionConfig,
  currentAction,
  targetType,
}: AutomationActionFormProps<TSalesAutomationActionConfigForm>) => {
  const form = useForm<TChecklistActionConfigForm>({
    resolver: zodResolver(checklistActionConfigFormSchema),
    defaultValues: getDefaultValues(currentAction?.config),
  });
  const { control, handleSubmit } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const { handleValidationErrors } = useFormValidationErrorHandler({
    formName: 'Sales checklist action configuration',
  });

  useAutomationRemoteFormSubmit({
    formRef,
    callback: () => {
      handleSubmit(onSaveActionConfig, handleValidationErrors)();
    },
  });

  return (
    <Form {...form}>
      <div className="flex flex-col gap-4">
        <Form.Field
          control={control}
          name="name"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Checklist name</Form.Label>
              <PlaceholderInput
                propertyType={targetType}
                value={field.value}
                onChange={field.onChange}
              />
              <Form.Message />
            </Form.Item>
          )}
        />

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Form.Label>Checklist items</Form.Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                append({
                  id: createChecklistItemId(),
                  label: '',
                  isChecked: false,
                })
              }
            >
              <IconPlus />
              Add item
            </Button>
          </div>

          <div className="flex flex-col gap-2">
            {fields.map((item, index) => (
              <div
                key={item.id}
                className="grid grid-cols-[1.5rem_1fr_2rem] items-start gap-2"
              >
                <Form.Field
                  control={control}
                  name={`items.${index}.isChecked`}
                  render={({ field }) => (
                    <Form.Item className="pt-2">
                      <Form.Control>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(checked) =>
                            field.onChange(checked === true)
                          }
                        />
                      </Form.Control>
                    </Form.Item>
                  )}
                />
                <Form.Field
                  control={control}
                  name={`items.${index}.label`}
                  render={({ field }) => (
                    <Form.Item>
                      <PlaceholderInput
                        propertyType={targetType}
                        value={field.value}
                        onChange={field.onChange}
                      />
                      <Form.Message />
                    </Form.Item>
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                  className="text-destructive"
                >
                  <IconTrash />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Form>
  );
};
