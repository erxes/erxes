import {
  Button,
  cn,
  DatePicker,
  Form,
  InfoCard,
  Input,
  Select,
  Switch,
  Textarea,
} from 'erxes-ui';
import { IFormStep } from '../types/formTypes';
import { useForm } from 'react-hook-form';
import { useErxesForm } from '../ context/erxesFormContext';
import { ErxesSteps } from './steps';
import { useAtom, useSetAtom } from 'jotai';
import {
  activeStepAtom,
  formValuesAtom,
  showConfirmationAtom,
} from '../states/erxesFormStates';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

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
  const setFormValues = useSetAtom(formValuesAtom);
  const fields = formData.fields.filter(
    (field) => field.pageNumber === step.order,
  );
  const form = useForm({
    defaultValues: defaultValue,
    resolver: zodResolver(schema),
  });

  const handleSubmit = (values: any) => {
    setFormValues((prev) => ({ ...(prev || {}), [step.order]: values }));

    isLastStep
      ? setShowConfirmation(true)
      : setActiveStep((prevStep) => prevStep + 1);
  };

  return (
    <Form {...form}>
      <form className="text-sm" onSubmit={form.handleSubmit(handleSubmit)}>
        <InfoCard
          title={formData?.title || ''}
          description={formData?.description || ''}
          className="p-2"
        >
          {stepsLength > 1 && (
            <ErxesSteps
              step={step.order}
              title={step.name}
              stepsLength={stepsLength}
              description={step.description}
            />
          )}
          <InfoCard.Content>
            <div className="grid md:grid-cols-2 gap-4 mb-2">
              {fields.map((erxesField) => {
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
            {stepsLength > activeStep ? (
              <Button type="submit">Next</Button>
            ) : (
              <Button type="submit">Submit</Button>
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
  <Form.Item {...props} className={cn(props.className, span && `col-span-2`)} />
);

// {
//   "formId": "3wuh4tvP06VTrweVXtBE8",
//   "browserInfo": {
//     "remoteAddress": "202.21.102.0/23",
//     "region": "Ulaanbaatar",
//     "countryCode": "MN",
//     "city": "Ulaanbaatar",
//     "country": "Mongolia",
//     "url": "//test",
//     "hostname": "https://w.office.erxes.io",
//     "language": "en-US",
//     "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36"
//   },
//   "submissions": [
//     {
//       "_id": "z-IF2Maz0IYFQwi-cu3Am",
//       "type": "input",
//       "text": "asdasdasd",
//       "value": "ff",
//       "validation": null,
//       "associatedFieldId": "",
//       "column": null
//     },
//     {
//       "_id": "TV_o24TLna-fPhchiv-vN",
//       "type": "input",
//       "text": "vfevdfvdfv",
//       "value": "ff",
//       "validation": null,
//       "associatedFieldId": "",
//       "column": null
//     }
//   ],
//   "cachedCustomerId": "RcZ03QmavkVqcTlolTbHG"
// }
