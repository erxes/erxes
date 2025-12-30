import { useAtomValue } from 'jotai';
import { z } from 'zod';
import { formSetupContentAtom } from '../states/formSetupStates';
import { FORM_CONTENT_SCHEMA } from '../constants/formSchema';
import {
  Button,
  Checkbox,
  DatePicker,
  Form,
  InfoCard,
  Input,
  Textarea,
  toast,
} from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';

export const FormPreview = () => {
  const formContent = useAtomValue(formSetupContentAtom);

  if (!formContent || !formContent.fields) {
    return (
      <div className="p-5">
        <InfoCard title="Preview">
          <InfoCard.Content>
            <p className="text-muted-foreground">No fields to preview</p>
          </InfoCard.Content>
        </InfoCard>
      </div>
    );
  }

  const formSchema: Record<string, z.ZodType> = {};
  formContent.fields.forEach((field) => {
    if (!field || !field.type) return;

    if (field.type === 'text' || field.type === 'textarea') {
      formSchema[field.id] = z.string();
    } else if (field.type === 'email') {
      formSchema[field.id] = z.string().email();
    } else if (field.type === 'number') {
      formSchema[field.id] = z.number();
    } else if (field.type === 'date') {
      formSchema[field.id] = z.date();
    } else if (field.type === 'boolean') {
      formSchema[field.id] = z.boolean();
    } else if (field.type === 'select') {
      formSchema[field.id] = z.string();
    }
  });

  const defaultValues = formContent.fields.reduce((acc, field) => {
    if (!field || !field.type) return acc;

    if (
      field.type === 'text' ||
      field.type === 'textarea' ||
      field.type === 'email' ||
      field.type === 'select'
    ) {
      acc[field.id] = '';
    } else if (field.type === 'number') {
      acc[field.id] = 0;
    } else if (field.type === 'date') {
      acc[field.id] = new Date();
    } else if (field.type === 'boolean') {
      acc[field.id] = false;
    }
    return acc;
  }, {} as Record<string, any>);

  return (
    <FormPreviewContent
      schema={z.object(formSchema)}
      fields={formContent.fields}
      steps={formContent.steps || []}
      defaultValues={defaultValues}
    />
  );
};

export const FormPreviewContent = ({
  schema,
  fields,
  steps,
  defaultValues,
}: {
  schema: z.ZodType;
  fields: z.infer<typeof FORM_CONTENT_SCHEMA>['fields'];
  steps: z.infer<typeof FORM_CONTENT_SCHEMA>['steps'];
  defaultValues: Record<string, any>;
}) => {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues,
  });

  const onSubmit = (data: z.infer<typeof schema>) => {
    toast({
      title: 'Success!',
      description: (
        <div>
          {Object.entries(data).map(([key, value]) => (
            <div key={key}>
              <span className="font-bold">
                {fields.find((field) => field?.id === key)?.label}:
              </span>{' '}
              {String(value as string)}
            </div>
          ))}
        </div>
      ),
    });
  };

  const fieldsByStep = React.useMemo(() => {
    const grouped: Record<string, typeof fields> = {};
    const firstStepId = steps[0]?.id || 'step-1';

    fields.forEach((field) => {
      if (!field) return;
      const stepId = field.stepId || firstStepId;
      if (!grouped[stepId]) {
        grouped[stepId] = [];
      }
      grouped[stepId].push(field);
    });

    return grouped;
  }, [fields, steps]);

  const orderedSteps = React.useMemo(() => {
    if (!steps || steps.length === 0) {
      return [{ id: 'step-1', label: 'Step 1' }];
    }
    return steps;
  }, [steps]);

  return (
    <div className="p-5">
      <InfoCard title="Preview">
        <InfoCard.Content>
          <Form {...form}>
            <form
              className="flex flex-col gap-6"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              {orderedSteps.map((step) => {
                const stepFields = fieldsByStep[step.id] || [];
                if (stepFields.length === 0) return null;

                return (
                  <div key={step.id} className="flex flex-col gap-4">
                    <h3 className="text-lg font-semibold">{step.label}</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {stepFields
                        .filter((formField) => formField != null)
                        .map((formField) => (
                          <Form.Field
                            key={formField.id}
                            name={formField.id}
                            render={({ field }) => (
                              <React.Fragment key={formField.id}>
                                {(formField.type === 'text' ||
                                  formField.type === 'textarea' ||
                                  formField.type === 'email') && (
                                  <Form.Item>
                                    <Form.Label>{formField.label}</Form.Label>
                                    <Form.Control>
                                      {formField.type === 'textarea' ? (
                                        <Textarea {...field} />
                                      ) : (
                                        <Input type="text" {...field} />
                                      )}
                                    </Form.Control>
                                  </Form.Item>
                                )}
                                {formField.type === 'number' && (
                                  <Form.Item>
                                    <Form.Label>{formField.label}</Form.Label>
                                    <Form.Control>
                                      <Input.Number {...field} />
                                    </Form.Control>
                                  </Form.Item>
                                )}
                                {formField.type === 'date' && (
                                  <Form.Item>
                                    <Form.Label>{formField.label}</Form.Label>
                                    <DatePicker
                                      value={field.value}
                                      onChange={field.onChange}
                                    />
                                  </Form.Item>
                                )}
                                {formField.type === 'boolean' && (
                                  <Form.Item className="flex items-center space-x-2 space-y-0">
                                    <Form.Control>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                      />
                                    </Form.Control>
                                    <Form.Label variant="peer">
                                      {formField.label}
                                    </Form.Label>
                                  </Form.Item>
                                )}
                                {formField.type === 'select' && (
                                  <Form.Item>
                                    <Form.Label>{formField.label}</Form.Label>
                                    <Form.Control>
                                      <select
                                        {...field}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                      >
                                        <option value="">Select...</option>
                                        {formField.options?.map((option) => (
                                          <option key={option} value={option}>
                                            {option}
                                          </option>
                                        ))}
                                      </select>
                                    </Form.Control>
                                  </Form.Item>
                                )}
                              </React.Fragment>
                            )}
                          />
                        ))}
                    </div>
                  </div>
                );
              })}
              <div className="text-right">
                <Button type="submit">Submit</Button>
              </div>
            </form>
          </Form>
        </InfoCard.Content>
      </InfoCard>
    </div>
  );
};
