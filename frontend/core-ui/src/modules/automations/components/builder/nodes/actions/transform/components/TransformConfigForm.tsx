import {
  transformConfigFormSchema,
  TRANSFORM_VALUE_TYPES,
  TTransformConfigForm,
} from '@/automations/components/builder/nodes/actions/transform/states/transformForm';
import { AutomationConfigFormWrapper } from '@/automations/components/builder/nodes/components/AutomationConfigFormWrapper';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  IconChevronDown,
  IconChevronRight,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react';
import { Button, Collapsible, Form, Input, Label, Select } from 'erxes-ui';
import { useState } from 'react';
import {
  FieldArrayWithId,
  FormProvider,
  useFieldArray,
  useForm,
  useFormContext,
} from 'react-hook-form';
import {
  PlaceholderInput,
  TAutomationAction,
  TAutomationActionProps,
  useFormValidationErrorHandler,
} from 'ui-modules';

const generateDefaultValues = (
  currentAction: TAutomationAction<TTransformConfigForm>,
): TTransformConfigForm => {
  const mappings = currentAction?.config?.mappings;

  return {
    mappings: mappings?.length
      ? mappings.map((mapping) => ({
          ...mapping,
          type: mapping.type || 'text',
          isExpression: mapping.isExpression || false,
        }))
      : [{ key: '', value: '', type: 'text', isExpression: false }],
  };
};

export const TransformConfigForm = ({
  currentAction,
  handleSave,
}: TAutomationActionProps<TTransformConfigForm>) => {
  const { handleValidationErrors } = useFormValidationErrorHandler({
    formName: 'Transform Configuration',
  });
  const form = useForm<TTransformConfigForm>({
    resolver: zodResolver(transformConfigFormSchema),
    defaultValues: generateDefaultValues(currentAction),
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'mappings',
  });

  return (
    <FormProvider {...form}>
      <AutomationConfigFormWrapper
        onSave={form.handleSubmit(handleSave, handleValidationErrors)}
      >
        <div className="flex w-[560px] flex-col gap-5">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Output mappings
            </Label>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                append({
                  key: '',
                  value: '',
                  type: 'text',
                  isExpression: false,
                })
              }
            >
              <IconPlus />
              Add mapping
            </Button>
          </div>

          {fields.map((field, index) => (
            <TranformConfigRow
              key={field.id}
              field={field}
              index={index}
              remove={remove}
              canRemove={fields.length > 1}
            />
          ))}
        </div>
      </AutomationConfigFormWrapper>
    </FormProvider>
  );
};

const TranformConfigRow = ({
  index,
  field,
  remove,
  canRemove,
}: {
  index: number;
  field: FieldArrayWithId<TTransformConfigForm, 'mappings'>;
  remove: (index: number) => void;
  canRemove: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { control, setValue } = useFormContext<TTransformConfigForm>();

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="overflow-hidden rounded-lg border bg-background"
    >
      <div className="flex items-center gap-3 p-3">
        <Collapsible.Trigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 shrink-0 text-muted-foreground"
          >
            {isOpen ? (
              <IconChevronDown className="size-4" />
            ) : (
              <IconChevronRight className="size-4" />
            )}
          </Button>
        </Collapsible.Trigger>
        <Form.Field
          control={control}
          name={`mappings.${index}.key`}
          render={({ field }) => (
            <Form.Item className="flex-1">
              {isOpen && <Form.Label>Output key</Form.Label>}
              <Input placeholder="fullName" {...field} />
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={control}
          name={`mappings.${index}.type`}
          render={({ field }) => (
            <Form.Item className="w-32">
              {isOpen && <Form.Label>Type</Form.Label>}
              <Select value={field.value} onValueChange={field.onChange}>
                <Select.Trigger>
                  <Select.Value />
                </Select.Trigger>
                <Select.Content>
                  {TRANSFORM_VALUE_TYPES.map((type) => (
                    <Select.Item key={type} value={type}>
                      {type}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="bg-destructive/10 text-destructive hover:bg-destructive/20"
          onClick={() => remove(index)}
          disabled={!canRemove}
        >
          <IconTrash className="size-4" />
        </Button>
      </div>

      <Collapsible.Content className="border-t bg-muted/20 p-4">
        <div key={field.id} className="flex flex-col gap-3">
          <Form.Field
            control={control}
            name={`mappings.${index}.value`}
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Value</Form.Label>
                <PlaceholderInput
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  isExpression={
                    control._formValues.mappings?.[index]?.isExpression
                  }
                  onChangeInputMode={(mode) =>
                    setValue(
                      `mappings.${index}.isExpression`,
                      mode === 'expression',
                    )
                  }
                  disabled={{ attribute: true }}
                >
                  <PlaceholderInput.Header />
                </PlaceholderInput>
                <Form.Message />
              </Form.Item>
            )}
          />
        </div>
      </Collapsible.Content>
    </Collapsible>
  );
};
