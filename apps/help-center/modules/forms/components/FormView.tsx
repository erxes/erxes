'use client';

import { useMutation } from '@apollo/client/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Badge } from 'erxes-ui/components/badge';
import { Button } from 'erxes-ui/components/button';
import { Form } from 'erxes-ui/components/form';
import { toast } from 'erxes-ui/hooks/use-toast';
import Link from 'next/link';
import { useState, type CSSProperties, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { Icon } from '@/modules/ui/components/Icon';
import { cn } from '@/modules/ui/lib/cn';
import { FORM_PORTAL_SUBMIT } from '../graphql/mutations/forms';
import { formTitle, type PortalForm, type SaveLeadResponse } from '../types';
import {
  defaultValues,
  fieldDescription,
  fieldKind,
  fieldLabel,
  fieldSpanClass,
  formPrimaryColor,
  formSchema,
  formSteps,
  isAnswerable,
  toSubmissions,
  type FormStep,
  type FormValues,
} from '../utils/fields';
import { FormFieldControl } from './FormFieldControl';

const browserInfo = () => ({
  url: typeof window === 'undefined' ? '' : window.location.href,
  hostname: typeof window === 'undefined' ? '' : window.location.hostname,
  language: typeof navigator === 'undefined' ? 'mn' : navigator.language,
  userAgent: typeof navigator === 'undefined' ? '' : navigator.userAgent,
});

const FormCard = ({
  title,
  description,
  primaryColor,
  children,
}: {
  title: string;
  description?: string;
  primaryColor: string;
  children: ReactNode;
}) => (
  <div
    className="flex flex-col rounded-xl bg-foreground/5 p-2"
    style={
      primaryColor
        ? ({ '--color-primary': primaryColor } as CSSProperties)
        : undefined
    }
  >
    <div className="flex h-7 shrink-0 items-center pl-2 pr-1">
      <h1 className="font-mono text-xs font-medium uppercase">{title}</h1>
    </div>
    {description ? (
      <p className="px-2 text-xs text-muted-foreground">{description}</p>
    ) : null}
    {children}
  </div>
);

const FormCardContent = ({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) => (
  <div
    className={cn(
      'mt-2 flex flex-col gap-3 rounded-lg bg-background p-3 shadow-sm',
      className,
    )}
  >
    {children}
  </div>
);

const FormCardActions = ({ children }: { children: ReactNode }) => (
  <div className="mb-2 mr-2 mt-4 flex justify-end gap-2">{children}</div>
);

const StepHeader = ({ steps, index }: { steps: FormStep[]; index: number }) => (
  <div className="m-2 mb-0 flex flex-none flex-col gap-3">
    <div className="flex items-center gap-2">
      <Badge className="rounded-xl font-mono text-xs">STEP {index + 1}</Badge>
      <h2 className="text-base font-semibold text-primary">
        {steps[index].name}
      </h2>
    </div>
    <div className="flex items-center gap-1">
      {steps.map((step, position) => (
        <div
          key={step.key}
          className={cn(
            'h-1 flex-1 rounded-full bg-border',
            position === index && 'bg-primary',
          )}
        />
      ))}
    </div>
    {steps[index].description ? (
      <div className="text-xs text-accent-foreground">
        {steps[index].description}
      </div>
    ) : null}
  </div>
);

export const FormView = ({ form: definition }: { form: PortalForm }) => {
  const steps = formSteps(definition);
  const answerable = steps.flatMap((step) => step.fields.filter(isAnswerable));
  const title = formTitle(definition);
  const description = definition.description?.trim() ?? '';
  const primaryColor = formPrimaryColor(definition);
  const submitLabel = definition.buttonText?.trim() || 'Send';

  const [stepIndex, setStepIndex] = useState(0);
  const step = steps[stepIndex];
  const isLastStep = stepIndex === steps.length - 1;

  const [submit, { data, loading, error, reset }] =
    useMutation<SaveLeadResponse>(FORM_PORTAL_SUBMIT);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema(answerable)),
    defaultValues: defaultValues(answerable),
  });

  const result = data?.cpWidgetsSaveLead;

  const showStepOf = (fieldId: string) => {
    const index = steps.findIndex((entry) =>
      entry.fields.some((field) => field._id === fieldId),
    );

    if (index >= 0) {
      setStepIndex(index);
    }
  };

  const goToNextStep = async () => {
    const stepFieldIds = step.fields
      .filter(isAnswerable)
      .map((field) => field._id);

    if (await form.trigger(stepFieldIds)) {
      setStepIndex((current) => current + 1);
    }
  };

  const onSubmit = async (values: FormValues) => {
    const response = await submit({
      variables: {
        formId: definition._id,
        submissions: toSubmissions(answerable, values),
        browserInfo: browserInfo(),
      },
    }).catch(() => null);

    const saved = response?.data?.cpWidgetsSaveLead;

    if (saved?.status === 'ok') {
      toast({
        variant: 'success',
        title: 'Received',
        description: 'Your completed form was saved.',
      });
      return;
    }

    const issues = (saved?.errors ?? []).filter((issue) => issue.fieldId);

    for (const issue of issues) {
      form.setError(issue.fieldId as string, {
        message: issue.text ?? 'That value is not valid.',
      });
    }

    if (issues[0]?.fieldId) {
      showStepOf(issues[0].fieldId);
    }
  };

  const submitForm = form.handleSubmit(onSubmit, (errors) => {
    const [firstFieldId] = Object.keys(errors);

    if (firstFieldId) {
      showStepOf(firstFieldId);
    }
  });

  if (result?.status === 'ok') {
    return (
      <FormCard
        title={definition.leadData?.thankTitle?.trim() || 'Form received'}
        primaryColor={primaryColor}
      >
        <FormCardContent>
          <p className="text-sm text-muted-foreground">
            {definition.leadData?.thankContent?.trim() ||
              'Thank you. The support team has received the details you submitted.'}
          </p>
        </FormCardContent>
        <FormCardActions>
          <Button variant="secondary" asChild>
            <Link href="/forms">Other forms</Link>
          </Button>
          <Button
            type="button"
            onClick={() => {
              form.reset(defaultValues(answerable));
              setStepIndex(0);
              reset();
            }}
          >
            Fill it in again
          </Button>
        </FormCardActions>
      </FormCard>
    );
  }

  if (!answerable.length) {
    return (
      <FormCard
        title={title}
        description={description}
        primaryColor={primaryColor}
      >
        <FormCardContent>
          <p className="text-sm text-muted-foreground">
            This form has no fields to fill in.
          </p>
        </FormCardContent>
      </FormCard>
    );
  }

  return (
    <Form {...form}>
      <form
        noValidate
        onSubmit={(event) => {
          if (isLastStep) {
            return submitForm(event);
          }

          event.preventDefault();

          return goToNextStep();
        }}
      >
        <FormCard
          title={title}
          description={description}
          primaryColor={primaryColor}
        >
          {steps.length > 1 ? (
            <StepHeader steps={steps} index={stepIndex} />
          ) : null}

          <FormCardContent>
            <div className="mb-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {step.fields.map((field) => {
                if (fieldKind(field) === 'content') {
                  return field.content ? (
                    <div
                      key={field._id}
                      className={cn('kb-article', fieldSpanClass(field))}
                      dangerouslySetInnerHTML={{ __html: field.content }}
                    />
                  ) : null;
                }

                if (!isAnswerable(field)) {
                  return (
                    <p
                      key={field._id}
                      className={cn(
                        'flex items-start gap-2 rounded-lg bg-warning-soft px-3.5 py-2.5 text-[13px] leading-relaxed text-warning',
                        fieldSpanClass(field),
                      )}
                    >
                      <Icon name="alert" size={15} className="mt-px shrink-0" />
                      The “{fieldLabel(field)}” field cannot be filled in from
                      the portal yet — please contact the support team.
                    </p>
                  );
                }

                const hint = fieldDescription(field);

                return (
                  <Form.Field
                    key={field._id}
                    control={form.control}
                    name={field._id}
                    render={({ field: control }) => (
                      <Form.Item className={fieldSpanClass(field)}>
                        <Form.Label>{fieldLabel(field)}</Form.Label>
                        {hint ? (
                          <Form.Description>{hint}</Form.Description>
                        ) : null}
                        <Form.Control>
                          <FormFieldControl
                            field={field}
                            value={control.value}
                            onChange={control.onChange}
                          />
                        </Form.Control>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                );
              })}

              {error ? (
                <p
                  role="alert"
                  className="flex items-start gap-2 rounded-lg bg-danger-soft px-3.5 py-2.5 text-[13px] leading-relaxed text-danger sm:col-span-2"
                >
                  <Icon name="alert" size={15} className="mt-px shrink-0" />
                  Something went wrong submitting the form: {error.message}
                </p>
              ) : null}
            </div>
          </FormCardContent>

          <FormCardActions>
            {steps.length > 1 ? (
              <Button
                type="button"
                variant="secondary"
                disabled={stepIndex === 0 || loading}
                onClick={() => setStepIndex((current) => current - 1)}
              >
                Previous
              </Button>
            ) : null}
            <Button type="submit" disabled={loading}>
              {isLastStep ? (loading ? 'Submitting…' : submitLabel) : 'Next'}
            </Button>
          </FormCardActions>
        </FormCard>
      </form>
    </Form>
  );
};
