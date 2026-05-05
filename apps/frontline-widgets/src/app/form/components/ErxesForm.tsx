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
  Select,
  Spinner,
  Switch,
  Textarea,
} from 'erxes-ui';
import { IFormFieldLogic, IFormStep } from '../types/formTypes';
import { useForm } from 'react-hook-form';
import { useErxesForm } from '../context/erxesFormContext';
import { ErxesSteps } from './steps';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import {
  activeStepAtom,
  browserInfoAtom,
  formValuesAtom,
  showConfirmationAtom,
} from '../states/erxesFormStates';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFormWidgetLead } from '../hooks/useFormWidgetLead';

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
  const { saveLead, loading: saveLeadLoading } = useFormWidgetLead();
  const fields = formData.fields.filter(
    (field) => field.pageNumber === step.order,
  );
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
      },
      onCompleted: () => {
        setFormValues({});
        setShowConfirmation(true);
      },
    });
  };

  return (
    <Form {...form}>
      <form className="text-sm" onSubmit={form.handleSubmit(handleSubmit)}>
        <InfoCard
          title={formData?.title || ''}
          description={formData?.description || ''}
          className="p-2 bg-background/40 [&_h3]:text-accent-foreground"
        >
          {stepsLength > 1 && (
            <ErxesSteps
              step={step.order}
              title={step.name}
              stepsLength={stepsLength}
              description={step.description}
            />
          )}
          <InfoCard.Content className="h-full">
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
                            <Form.Label>{erxesField.text}</Form.Label>
                            <Input.Number
                              value={field.value}
                              onChange={(value) => field.onChange(value)}
                              placeholder={erxesField.text}
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
                            span={erxesField.column}
                            className="flex items-end gap-2 space-y-0"
                          >
                            <div className="flex items-center gap-2 h-8">
                              <Form.Control>
                                <Switch {...field} />
                              </Form.Control>
                              <Form.Label variant="peer">
                                {erxesField.text}
                              </Form.Label>
                            </div>
                            <Form.Message />
                          </ErxesFormItem>
                        );
                      }
                      if (erxesField.type === 'textarea') {
                        return (
                          <ErxesFormItem span={erxesField.column}>
                            <Form.Label>{erxesField.text}</Form.Label>
                            <Textarea
                              {...field}
                              placeholder={erxesField.text}
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
                        return (
                          <ErxesFormItem span={erxesField.column}>
                            <Form.Label>{erxesField.text}</Form.Label>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <Form.Control>
                                <Select.Trigger>
                                  <Select.Value placeholder={erxesField.text} />
                                </Select.Trigger>
                              </Form.Control>
                              <Select.Content>
                                {erxesField.options.map((option) => (
                                  <Select.Item key={option} value={option}>
                                    {option}
                                  </Select.Item>
                                ))}
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

                      if (erxesField.type === 'radio') {
                        return (
                          <ErxesFormItem span={erxesField.column}>
                            <Form.Label>{erxesField.text}</Form.Label>
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
                                    />
                                    <Label
                                      htmlFor={`${erxesField._id}-${option}`}
                                    >
                                      {option}
                                    </Label>
                                  </div>
                                ))}
                              </RadioGroup>
                            </Form.Control>
                            {erxesField.description && (
                              <Form.Description>
                                {erxesField.description}
                              </Form.Description>
                            )}
                            <Form.Message />
                          </ErxesFormItem>
                        );
                      }

                      if (erxesField.type === 'check') {
                        return (
                          <ErxesFormItem span={erxesField.column}>
                            <Form.Label>{erxesField.text}</Form.Label>
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
                                    />
                                    <span className="text-sm">{option}</span>
                                  </label>
                                );
                              })}
                            </div>
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
                          <ErxesFormItem span={erxesField.column}>
                            <Form.Label>{erxesField.text}</Form.Label>
                            <DatePicker
                              {...field}
                              placeholder={erxesField.text}
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
                        <ErxesFormItem span={erxesField.column}>
                          <Form.Label>{erxesField.text}</Form.Label>
                          <Input {...field} placeholder={erxesField.text} />
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
      'col-span-1': span === 1,
    })}
  />
);
