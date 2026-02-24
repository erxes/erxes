import { IntegrationSteps } from '@/integrations/components/IntegrationSteps';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Checkbox,
  cn,
  DatePicker,
  Form,
  InfoCard,
  Input,
  readImage,
  Select,
  Textarea,
  toast,
} from 'erxes-ui';
import { useAtomValue } from 'jotai';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { FORM_CONTENT_SCHEMA } from '../constants/formSchema';
import {
  formSetupConfirmationAtom,
  formSetupContentAtom,
  formSetupGeneralAtom,
  formSetupStepAtom,
} from '../states/formSetupStates';

export const FormPreview = () => {
  const formContent = useAtomValue(formSetupContentAtom);
  const formGeneral = useAtomValue(formSetupGeneralAtom);
  const formConfirmation = useAtomValue(formSetupConfirmationAtom);
  const [activeStep, setActiveStep] = useState<number>(1);
  const activeFormStep = useAtomValue(formSetupStepAtom);

  if (!formContent || !formContent.steps) {
    return (
      <div className="p-5">
        <InfoCard title={formGeneral.title}>
          <InfoCard.Content>
            <p className="text-muted-foreground">No fields to preview</p>
          </InfoCard.Content>
        </InfoCard>
      </div>
    );
  }

  if (activeFormStep === 3) {
    return (
      <div className="p-5">
        <InfoCard title={formConfirmation.title}>
          <InfoCard.Content>
            <p className="text-muted-foreground">
              {formConfirmation.description}
            </p>
            {formConfirmation.image && (
              <div className="relative rounded-md aspect-video">
                <img
                  src={readImage(formConfirmation.image.url)}
                  alt="confirmation"
                  className="w-full h-auto object-cover"
                />
              </div>
            )}
            <Button>{formGeneral.buttonText || 'Send'}</Button>
          </InfoCard.Content>
        </InfoCard>
      </div>
    );
  }

  const { steps } = formContent;

  const formSchemas = Object.fromEntries(
    Object.entries(steps).map(([stepId, step]) => {
      const formSchema: Record<string, z.ZodType> = {};
      step.fields.forEach((field) => {
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
      return [stepId, z.object(formSchema)];
    }),
  );

  const defaultValues = Object.fromEntries(
    Object.entries(formContent.steps).map(([stepId, step]) => {
      const stepDefaultValues: Record<string, any> = {};
      step.fields.forEach((field) => {
        if (!field || !field.type) return;
        if (
          field.type === 'text' ||
          field.type === 'textarea' ||
          field.type === 'email' ||
          field.type === 'select'
        ) {
          stepDefaultValues[field.id] = '';
        } else if (field.type === 'number') {
          stepDefaultValues[field.id] = 0;
        } else if (field.type === 'date') {
          stepDefaultValues[field.id] = new Date();
        } else if (field.type === 'boolean') {
          stepDefaultValues[field.id] = false;
        }
      });
      return [stepId, stepDefaultValues];
    }),
  );

  return (
    <div className="p-5">
      {Object.entries(formContent.steps)
        .sort((a, b) => a[1].order - b[1].order)
        .map(([stepId, step], index) => (
          <FormPreviewContent
            key={stepId}
            visible={activeStep === index + 1}
            schema={formSchemas[stepId]}
            defaultValues={defaultValues[stepId]}
            fields={step.fields}
            step={index + 1}
            title={step.name || ''}
            description={step.description || ''}
            stepsLength={Object.keys(formContent.steps).length}
            setActiveStep={setActiveStep}
          />
        ))}
    </div>
  );
};

export const FormPreviewContent = ({
  visible,
  schema,
  defaultValues,
  fields,
  step,
  title,
  description,
  stepsLength,
  setActiveStep,
}: {
  visible: boolean;
  schema: z.ZodType;
  defaultValues: Record<string, any>;
  fields: z.infer<typeof FORM_CONTENT_SCHEMA>['steps'][number]['fields'];
  step: number;
  title: string;
  description: string;
  stepsLength: number;
  setActiveStep: (step: number) => void;
}) => {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues,
  });
  const formGeneral = useAtomValue(formSetupGeneralAtom);
  return (
    <Form {...form}>
      <form
        aria-hidden={!visible}
        className={cn('hidden', visible && 'block')}
        onSubmit={form.handleSubmit((values) => {
          if (stepsLength === step) {
            toast({
              title: 'Form submitted',
              description: 'Form submitted successfully',
              variant: 'success',
            });
            return;
          }
          setActiveStep(step + 1);
        })}
      >
        <InfoCard title={formGeneral.title} className="p-2">
          {formGeneral.description && (
            <div className="text-xs text-muted-foreground px-2">
              {formGeneral.description}
            </div>
          )}
          {stepsLength > 1 && (
            <IntegrationSteps
              step={step}
              title={title}
              stepsLength={stepsLength}
              description={description}
              className="p-0 m-2 mb-0"
            />
          )}
          <InfoCard.Content className="mt-2">
            <div className="grid grid-cols-2 gap-4 mb-2">
              {fields.map((erxesField) => {
                return (
                  <Form.Field
                    key={erxesField.id}
                    name={erxesField.id}
                    control={form.control}
                    render={({ field }) => {
                      if (erxesField.type === 'number') {
                        return (
                          <ErxesFormItem span={erxesField.span}>
                            <Form.Label>{erxesField.label}</Form.Label>
                            <Input.Number
                              value={field.value}
                              onChange={(value) => field.onChange(value)}
                              placeholder={erxesField.placeholder}
                            />
                            {erxesField.description && (
                              <Form.Description>
                                {erxesField.description}
                              </Form.Description>
                            )}
                            <Form.Message />
                          </ErxesFormItem>
                        );
                      }
                      if (erxesField.type === 'boolean') {
                        return (
                          <ErxesFormItem
                            span={erxesField.span}
                            className="flex items-end gap-2 space-y-0"
                          >
                            <div className="flex items-center gap-2 h-8">
                              <Form.Control>
                                <Checkbox {...field} />
                              </Form.Control>
                              <Form.Label variant="peer">
                                {erxesField.label}
                              </Form.Label>
                            </div>
                            <Form.Message />
                          </ErxesFormItem>
                        );
                      }
                      if (erxesField.type === 'textarea') {
                        return (
                          <ErxesFormItem span={erxesField.span}>
                            <Form.Label>{erxesField.label}</Form.Label>
                            <Textarea
                              {...field}
                              placeholder={erxesField.placeholder}
                            />
                            {erxesField.description && (
                              <Form.Description>
                                {erxesField.description}
                              </Form.Description>
                            )}
                            <Form.Message />
                          </ErxesFormItem>
                        );
                      }

                      if (erxesField.type === 'select') {
                        console.log('erxesField', erxesField);
                        return (
                          <ErxesFormItem span={erxesField.span}>
                            <Form.Label>{erxesField.label}</Form.Label>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <Form.Control>
                                <Select.Trigger>
                                  <Select.Value
                                    placeholder={erxesField.placeholder}
                                  />
                                </Select.Trigger>
                              </Form.Control>
                              <Select.Content>
                                {erxesField.options.map((option) => {
                                  if (!option) return null;

                                  return (
                                    <Select.Item key={option} value={option}>
                                      {option}
                                    </Select.Item>
                                  );
                                })}
                              </Select.Content>
                            </Select>
                            {erxesField.description && (
                              <Form.Description>
                                {erxesField.description}
                              </Form.Description>
                            )}
                            <Form.Message />
                          </ErxesFormItem>
                        );
                      }

                      if (erxesField.type === 'date') {
                        return (
                          <ErxesFormItem span={erxesField.span}>
                            <Form.Label>{erxesField.label}</Form.Label>
                            <DatePicker
                              {...field}
                              placeholder={erxesField.placeholder}
                            />
                            {erxesField.description && (
                              <Form.Description>
                                {erxesField.description}
                              </Form.Description>
                            )}
                            <Form.Message />
                          </ErxesFormItem>
                        );
                      }

                      return (
                        <ErxesFormItem span={erxesField.span}>
                          <Form.Label>{erxesField.label}</Form.Label>
                          <Input
                            {...field}
                            placeholder={erxesField.placeholder}
                          />
                          {erxesField.description && (
                            <Form.Description>
                              {erxesField.description}
                            </Form.Description>
                          )}
                          <Form.Message />
                        </ErxesFormItem>
                      );
                    }}
                  />
                );
              })}
            </div>
          </InfoCard.Content>
          {stepsLength > 1 ? (
            <div className="flex justify-end mt-4 mb-2 mr-2 gap-2">
              <Button
                variant="secondary"
                onClick={() => setActiveStep(step - 1)}
                disabled={step === 1}
              >
                Previous
              </Button>
              <Button type="submit">
                {stepsLength > step ? 'Next' : formGeneral.buttonText || 'Send'}
              </Button>
            </div>
          ) : (
            <div className="flex justify-end mt-4 mb-2 mr-2 gap-2">
              <Button type="submit">{formGeneral.buttonText || 'Send'}</Button>
            </div>
          )}
        </InfoCard>
      </form>
    </Form>
  );
};

export const ErxesFormItem = ({
  span,
  ...props
}: React.ComponentProps<typeof Form.Item> & { span: number }) => (
  <Form.Item
    {...props}
    className={cn(props.className, span && `col-span-${span}`)}
  />
);
