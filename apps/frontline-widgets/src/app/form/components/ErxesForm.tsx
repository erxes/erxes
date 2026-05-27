import {
  Button,
  Checkbox,
  cn,
  DatePicker,
  Form,
  InfoCard,
  Input,
  Label,
  RadioGroup,
  Spinner,
  Switch,
  Textarea,
  Upload,
} from 'erxes-ui';
import { IAttachment, IFormFieldLogic, IFormStep } from '../types/formTypes';
import { useForm } from 'react-hook-form';
import { useErxesForm } from '../context/erxesFormContext';
import { ErxesSteps } from './steps';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import {
  activeStepAtom,
  browserInfoAtom,
  customerIdAtom,
  formValuesAtom,
  showConfirmationAtom,
} from '../states/erxesFormStates';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFormWidgetLead } from '../hooks/useFormWidgetLead';
import { ComboboxField } from './ComboboxField';
import { SelectField } from './SelectField';
import { useParams } from 'react-router-dom';
import React from 'react';

const checkLogic = (
  logic: IFormFieldLogic,
  formValues: Record<string, any>,
): boolean => {
  const fieldValue = formValues[logic.fieldId];
  const logicValue = logic.logicValue;

  switch (logic.logicOperator) {
    case 'is':
      return String(fieldValue ?? '') === String(logicValue ?? '');
    case 'isNot':
      return String(fieldValue ?? '') !== String(logicValue ?? '');
    case 'contains':
      return String(fieldValue ?? '').includes(String(logicValue ?? ''));
    case 'doesNotContain':
      return !String(fieldValue ?? '').includes(String(logicValue ?? ''));
    case 'startsWith':
      return String(fieldValue ?? '').startsWith(String(logicValue ?? ''));
    case 'endsWith':
      return String(fieldValue ?? '').endsWith(String(logicValue ?? ''));
    case 'isUnknown':
      return (
        fieldValue === undefined || fieldValue === null || fieldValue === ''
      );
    case 'hasAnyValue':
      return (
        fieldValue !== undefined && fieldValue !== null && fieldValue !== ''
      );
    case 'greaterThan':
      return Number(fieldValue) > Number(logicValue);
    case 'lessThan':
      return Number(fieldValue) < Number(logicValue);
    case 'dateGreaterThan':
      return new Date(fieldValue) > new Date(logicValue);
    case 'dateLessThan':
      return new Date(fieldValue) < new Date(logicValue);
    default:
      return true;
  }
};

const isFieldVisible = (
  logics: IFormFieldLogic[] | undefined,
  logicAction: string | undefined,
  formValues: Record<string, any>,
): boolean => {
  if (!logics || logics.length === 0) return true;

  const allFulfilled = logics.every((logic) => checkLogic(logic, formValues));
  return logicAction === 'hide' ? !allFulfilled : allFulfilled;
};

export const ErxesForm = ({
  step,
  stepsLength,
  defaultValue,
  schema,
  isLastStep,
}: {
  step: IFormStep;
  stepsLength: number;
  defaultValue: any;
  schema: z.ZodSchema;
  isLastStep: boolean;
}) => {
  const formData = useErxesForm();
  const [activeStep, setActiveStep] = useAtom(activeStepAtom);
  const setShowConfirmation = useSetAtom(showConfirmationAtom);
  const [globalFormValues, setFormValues] = useAtom(formValuesAtom);
  const browserInfo = useAtomValue(browserInfoAtom) || {};
  const { id } = useParams<{ id: string }>();
  const { saveLead, loading: saveLeadLoading } = useFormWidgetLead();
  const [customerId, setCustomerId] = useAtom(customerIdAtom);
  const fields = formData.fields.filter(
    (field) => field.pageNumber === step.order,
  );
  const [attachments, setAttachments] = React.useState<IAttachment[]>([]);

  const addAttachment = (attachment: IAttachment) => {
    setAttachments((prev) => [...prev, attachment]);
  };

  const loadType = formData?.leadData?.loadType;
  const isPopup = loadType === 'popup';

  const form = useForm({
    defaultValues: defaultValue,
    resolver: zodResolver(schema),
  });

  const currentStepValues = form.watch();

  // Merge saved values from all steps with the current step's live values so
  // that logic referencing fields on other pages resolves correctly.
  const formValues = {
    ...Object.values(globalFormValues || {}).reduce<Record<string, any>>(
      (acc, stepValues) => ({ ...acc, ...stepValues }),
      {},
    ),
    ...currentStepValues,
  };

  const handleSubmit = (values: any) => {
    const updatedFormValues = {
      ...(globalFormValues || {}),
      [step.order]: values,
    };
    setFormValues(updatedFormValues);

    if (!isLastStep) {
      setActiveStep((prevStep) => prevStep + 1);
      return;
    }

    const submissions = Object.values(updatedFormValues).reduce<
      Record<string, any>
    >((acc, curr) => ({ ...acc, ...(curr as Record<string, any>) }), {});

    saveLead({
      variables: {
        formId: formData._id,
        submissions: Object.entries(submissions).map(([key, value]) => {
          const field = formData.fields.find((f) => f._id === key);
          return {
            _id: key,
            type: field?.type || 'input',
            text: field?.text || key,
            value,
          };
        }),
        browserInfo,
        cachedCustomerId: customerId || undefined,
      },
      onCompleted: (data) => {
        setFormValues({});
        setShowConfirmation(true);
        setCustomerId(data?.widgetsSaveLead?.customerId || '');
      },
    });
  };

  return (
    <Form {...form}>
      <form
        className={cn('text-sm')}
        onSubmit={form.handleSubmit(handleSubmit)}
      >
        <InfoCard
          title={formData?.title || ''}
          description={formData?.description || ''}
          className={cn(
            {
              'max-h-[600px] min-h-[400px] flex flex-col overflow-y-hidden':
                id || isPopup,
            },
            'p-2 bg-background/40 [&_h3]:text-foreground',
          )}
        >
          {stepsLength > 1 && (
            <ErxesSteps
              step={step.order}
              title={step.name}
              stepsLength={stepsLength}
              description={step.description}
            />
          )}
          <InfoCard.Content
            className={cn(
              {
                'flex-1 styled-scroll hide-scroll overflow-y-auto':
                  id || isPopup,
              },
              'h-full mt-2',
            )}
          >
            <div className="grid md:grid-cols-2 gap-4 mb-2">
              {fields.map((erxesField) => {
                if (
                  !isFieldVisible(
                    erxesField.logics,
                    erxesField.logicAction,
                    formValues,
                  )
                ) {
                  return null;
                }
                return (
                  <Form.Field
                    key={erxesField._id}
                    name={erxesField._id}
                    control={form.control}
                    render={({ field }) => {
                      if (erxesField.type === 'number') {
                        return (
                          <ErxesFormItem span={erxesField.column}>
                            <Form.Label className="text-widget-label">
                              {erxesField.text}
                              {erxesField.isRequired && (
                                <span className="text-destructive"> *</span>
                              )}
                            </Form.Label>
                            <Input.Number
                              value={field.value}
                              onChange={(value) => field.onChange(value)}
                              placeholder={erxesField.text}
                              required={erxesField.isRequired}
                            />
                            {erxesField.description && (
                              <Form.Description
                                dangerouslySetInnerHTML={{
                                  __html: erxesField.description,
                                }}
                              />
                            )}
                            <Form.Message />
                          </ErxesFormItem>
                        );
                      }
                      if (erxesField.type === 'boolean') {
                        return (
                          <ErxesFormItem
                            span={erxesField.column}
                            className="flex items-end gap-2 space-y-0"
                          >
                            <div className="flex items-center gap-2 h-8">
                              <Form.Control>
                                <Switch
                                  {...field}
                                  checked={field.value}
                                  onCheckedChange={(checked) =>
                                    field.onChange(checked)
                                  }
                                  required={erxesField.isRequired}
                                />
                              </Form.Control>
                              <Form.Label variant="peer">
                                {erxesField.text}
                                {erxesField.isRequired && (
                                  <span className="text-destructive"> *</span>
                                )}
                              </Form.Label>
                            </div>
                            <Form.Message />
                          </ErxesFormItem>
                        );
                      }
                      if (
                        erxesField.type === 'textarea' ||
                        erxesField.type === 'core:customer:description'
                      ) {
                        return (
                          <ErxesFormItem span={erxesField.column}>
                            <Form.Label className="text-widget-label">
                              {erxesField.text}
                              {erxesField.isRequired && (
                                <span className="text-destructive"> *</span>
                              )}
                            </Form.Label>
                            <Textarea
                              {...field}
                              placeholder={erxesField.text}
                              required={erxesField.isRequired}
                            />
                            {erxesField.description && (
                              <Form.Description
                                dangerouslySetInnerHTML={{
                                  __html: erxesField.description,
                                }}
                              />
                            )}
                            <Form.Message />
                          </ErxesFormItem>
                        );
                      }

                      if (
                        erxesField.type === 'select' ||
                        erxesField.allowSearch === true
                      ) {
                        if (erxesField.allowSearch) {
                          return (
                            <ComboboxField
                              field={field}
                              erxesField={erxesField}
                            />
                          );
                        }
                        return (
                          <SelectField field={field} erxesField={erxesField} />
                        );
                      }

                      if (
                        erxesField.type === 'radio' ||
                        erxesField.type === 'core:customer:sex'
                      ) {
                        return (
                          <ErxesFormItem span={erxesField.column}>
                            <Form.Label className="text-widget-label">
                              {erxesField.text}
                              {erxesField.isRequired && (
                                <span className="text-destructive"> *</span>
                              )}
                            </Form.Label>
                            <Form.Control>
                              <RadioGroup
                                value={field.value}
                                onValueChange={field.onChange}
                              >
                                {erxesField.options.map((option) => (
                                  <div
                                    key={option}
                                    className="flex items-center gap-2"
                                  >
                                    <RadioGroup.Item
                                      value={option}
                                      id={`${erxesField._id}-${option}`}
                                      required={erxesField.isRequired}
                                    />
                                    <Label
                                      htmlFor={`${erxesField._id}-${option}`}
                                      className="text-xs"
                                    >
                                      {option}
                                    </Label>
                                  </div>
                                ))}
                              </RadioGroup>
                            </Form.Control>
                            {erxesField.description && (
                              <Form.Description
                                dangerouslySetInnerHTML={{
                                  __html: erxesField.description,
                                }}
                              />
                            )}
                            <Form.Message />
                          </ErxesFormItem>
                        );
                      }

                      if (erxesField.type === 'check') {
                        return (
                          <ErxesFormItem span={erxesField.column}>
                            <Form.Label className="text-widget-label">
                              {erxesField.text}
                              {erxesField.isRequired && (
                                <span className="text-destructive"> *</span>
                              )}
                            </Form.Label>
                            <div className="flex flex-col gap-2">
                              {erxesField.options.map((option) => {
                                if (!option) return null;
                                const checked = (
                                  (field.value as string[]) || []
                                ).includes(option);
                                return (
                                  <label
                                    key={option}
                                    className="flex items-center gap-2 cursor-pointer"
                                  >
                                    <Checkbox
                                      checked={checked}
                                      id={`${erxesField._id}-${option}`}
                                      onCheckedChange={(isChecked) => {
                                        const current =
                                          (field.value as string[]) || [];
                                        field.onChange(
                                          isChecked
                                            ? [...current, option]
                                            : current.filter(
                                                (v) => v !== option,
                                              ),
                                        );
                                      }}
                                      required={erxesField.isRequired}
                                    />
                                    <Label
                                      htmlFor={`${erxesField._id}-${option}`}
                                      className="text-xs"
                                    >
                                      {option}
                                    </Label>
                                  </label>
                                );
                              })}
                            </div>
                            {erxesField.description && (
                              <Form.Description
                                dangerouslySetInnerHTML={{
                                  __html: erxesField.description,
                                }}
                              />
                            )}
                            <Form.Message />
                          </ErxesFormItem>
                        );
                      }

                      if (
                        erxesField.type === 'date' ||
                        erxesField.type === 'core:customer:birthDate'
                      ) {
                        return (
                          <ErxesFormItem span={erxesField.column}>
                            <Form.Label className="text-widget-label">
                              {erxesField.text}
                              {erxesField.isRequired && (
                                <span className="text-destructive"> *</span>
                              )}
                            </Form.Label>
                            <Form.Control>
                              <DatePicker
                                value={
                                  field.value
                                    ? new Date(field.value)
                                    : undefined
                                }
                                onChange={(date) => field.onChange(date)}
                                placeholder={erxesField.text}
                                mode="single"
                              />
                            </Form.Control>
                            {erxesField.description && (
                              <Form.Description
                                dangerouslySetInnerHTML={{
                                  __html: erxesField.description,
                                }}
                              />
                            )}
                            <Form.Message />
                          </ErxesFormItem>
                        );
                      }

                      if (erxesField.type === 'file') {
                        return (
                          <ErxesFormItem span={erxesField.column}>
                            <Form.Label className="text-widget-label">
                              {erxesField.text}
                              {erxesField.isRequired && (
                                <span className="text-destructive"> *</span>
                              )}
                            </Form.Label>
                            <Form.Control>
                              <Upload.Root
                                value={
                                  Array.isArray(field.value)
                                    ? field.value[field.value.length - 1] ?? ''
                                    : field.value ?? ''
                                }
                                onChange={(fileInfo) => {
                                  if (typeof fileInfo === 'string') {
                                    field.onChange([]);
                                  } else if ('url' in fileInfo) {
                                    addAttachment(fileInfo as any);
                                    const current: string[] = Array.isArray(
                                      field.value,
                                    )
                                      ? field.value
                                      : [];
                                    field.onChange([
                                      ...current,
                                      fileInfo.url as string,
                                    ]);
                                  }
                                }}
                                multiple
                              >
                                <Upload.Preview className="rounded-full" />
                                <Upload.Button
                                  type="button"
                                  variant={'outline'}
                                  size={'sm'}
                                >
                                  {erxesField.content || 'Upload file'}
                                </Upload.Button>
                                {Array.isArray(field.value) &&
                                  field.value.length > 0 && (
                                    <Upload.RemoveButton
                                      variant={'destructive'}
                                      size={'sm'}
                                    />
                                  )}
                              </Upload.Root>
                            </Form.Control>
                            {erxesField.description && (
                              <Form.Description
                                dangerouslySetInnerHTML={{
                                  __html: erxesField.description,
                                }}
                              />
                            )}
                            <Form.Message />
                          </ErxesFormItem>
                        );
                      }
                      if (erxesField.type === 'core:customer:avatar') {
                        return (
                          <ErxesFormItem span={erxesField.column}>
                            <Form.Label className="text-widget-label">
                              {erxesField.text}
                              {erxesField.isRequired && (
                                <span className="text-destructive"> *</span>
                              )}
                            </Form.Label>
                            <Form.Control>
                              <Upload.Root
                                value={field.value}
                                onChange={(fileInfo) => {
                                  if (typeof fileInfo === 'string') {
                                    field.onChange('');
                                  } else if ('url' in fileInfo) {
                                    field.onChange(fileInfo.url);
                                  }
                                }}
                              >
                                <Upload.Preview className="rounded-full" />
                                <Upload.Button
                                  type="button"
                                  variant={'outline'}
                                  size={'sm'}
                                >
                                  {erxesField.content || 'Upload file'}
                                </Upload.Button>
                                {field.value && (
                                  <Upload.RemoveButton
                                    variant={'destructive'}
                                    size={'sm'}
                                  />
                                )}
                              </Upload.Root>
                            </Form.Control>
                            {erxesField.description && (
                              <Form.Description
                                dangerouslySetInnerHTML={{
                                  __html: erxesField.description,
                                }}
                              />
                            )}
                            <Form.Message />
                          </ErxesFormItem>
                        );
                      }

                      if (
                        erxesField.type === 'core:customer:firstName' ||
                        erxesField.type === 'core:customer:lastName' ||
                        erxesField.type === 'core:customer:middleName' ||
                        erxesField.type === 'core:customer:phone'
                      ) {
                        return (
                          <ErxesFormItem span={erxesField.column}>
                            <Form.Label
                              htmlFor={erxesField._id}
                              className="text-widget-label"
                            >
                              {erxesField.text}
                              {erxesField.isRequired && (
                                <span className="text-destructive"> *</span>
                              )}
                            </Form.Label>
                            {erxesField.description && (
                              <Form.Description
                                dangerouslySetInnerHTML={{
                                  __html: erxesField.description,
                                }}
                              />
                            )}
                            <Input
                              {...field}
                              id={erxesField._id}
                              name={erxesField.type.split(':').slice(-1)[0]}
                              placeholder={erxesField.content}
                              required={erxesField.isRequired}
                            />
                            <Form.Message />
                          </ErxesFormItem>
                        );
                      }
                      return (
                        <ErxesFormItem span={erxesField.column}>
                          <Form.Label
                            htmlFor={erxesField._id}
                            className="text-widget-label"
                          >
                            {erxesField.text}
                            {erxesField.isRequired && (
                              <span className="text-destructive"> *</span>
                            )}
                          </Form.Label>
                          {erxesField.description && (
                            <Form.Description
                              dangerouslySetInnerHTML={{
                                __html: erxesField.description,
                              }}
                            />
                          )}
                          <Input
                            {...field}
                            id={erxesField._id}
                            placeholder={erxesField.content}
                            required={erxesField.isRequired}
                          />
                          <Form.Message />
                        </ErxesFormItem>
                      );
                    }}
                  />
                );
              })}
            </div>
          </InfoCard.Content>
          <div className="flex justify-end mt-4 mb-2 mr-3 gap-2">
            {stepsLength > 1 && (
              <Button
                variant="secondary"
                onClick={() => setActiveStep((prevStep) => prevStep - 1)}
                disabled={activeStep === 1}
              >
                Previous
              </Button>
            )}
            {isLastStep ? (
              <Button type="submit" disabled={saveLeadLoading}>
                {saveLeadLoading && (
                  <Spinner containerClassName="size-4 flex-none" />
                )}
                {formData.buttonText || 'Submit'}
              </Button>
            ) : (
              <Button type="submit">Next</Button>
            )}
          </div>
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
    className={cn(props.className, {
      'col-span-2': span === 2,
      'md:col-span-1 col-span-2': span === 1,
    })}
  />
);
