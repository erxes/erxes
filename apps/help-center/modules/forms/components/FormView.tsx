'use client';

import { useMutation } from '@apollo/client/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from 'erxes-ui/components/form';
import { toast } from 'erxes-ui/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { Button, ButtonLink } from '@/modules/ui/components/Button';
import { Card } from '@/modules/ui/components/Card';
import { Icon } from '@/modules/ui/components/Icon';
import { FORM_PORTAL_SUBMIT } from '../graphql/mutations/forms';
import type { PortalForm, SaveLeadResponse } from '../types';
import {
  defaultValues,
  fieldHint,
  fieldKind,
  fieldLabel,
  isAnswerable,
  orderedFields,
  formSchema,
  toSubmissions,
  type FormValues,
} from '../utils/fields';
import { FormFieldControl } from './FormFieldControl';

const browserInfo = () => ({
  url: typeof window === 'undefined' ? '' : window.location.href,
  hostname: typeof window === 'undefined' ? '' : window.location.hostname,
  language: typeof navigator === 'undefined' ? 'mn' : navigator.language,
  userAgent: typeof navigator === 'undefined' ? '' : navigator.userAgent,
});

export const FormView = ({ form: definition }: { form: PortalForm }) => {
  const fields = orderedFields(definition.fields ?? []);
  const answerable = fields.filter(isAnswerable);

  const [submit, { data, loading, error, reset }] =
    useMutation<SaveLeadResponse>(FORM_PORTAL_SUBMIT);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema(answerable)),
    defaultValues: defaultValues(answerable),
  });

  const result = data?.cpWidgetsSaveLead;

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

    for (const issue of saved?.errors ?? []) {
      if (issue.fieldId) {
        form.setError(issue.fieldId, {
          message: issue.text ?? 'That value is not valid.',
        });
      }
    }
  };

  if (result?.status === 'ok') {
    return (
      <Card className="p-7 text-center">
        <span className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-success-soft text-success">
          <Icon name="check" size={22} />
        </span>
        <h2 className="text-lg font-semibold text-ink">Form received</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          Thank you. The support team has received the details you submitted.
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <ButtonLink href="/forms" variant="secondary">
            Other forms
          </ButtonLink>
          <Button
            variant="ghost"
            onClick={() => {
              form.reset(defaultValues(answerable));
              reset();
            }}
          >
            Fill it in again
          </Button>
        </div>
      </Card>
    );
  }

  if (!answerable.length) {
    return (
      <Card className="p-7 text-center">
        <p className="text-sm text-muted-foreground">
          This form has no fields to fill in.
        </p>
      </Card>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
        className="overflow-hidden rounded-xl border border-line bg-white"
      >
        <div className="space-y-6 px-5 py-6 sm:px-7">
          {fields.map((field) => {
            if (fieldKind(field) === 'content') {
              return field.content ? (
                <div
                  key={field._id}
                  className="kb-article rounded-lg bg-subtle px-4 py-3.5"
                  dangerouslySetInnerHTML={{ __html: field.content }}
                />
              ) : null;
            }

            if (!isAnswerable(field)) {
              return (
                <p
                  key={field._id}
                  className="flex items-start gap-2 rounded-lg bg-warning-soft px-3.5 py-2.5 text-[13px] leading-relaxed text-warning"
                >
                  <Icon name="alert" size={15} className="mt-px shrink-0" />
                  The “{fieldLabel(field)}” field cannot be filled in from the
                  portal yet — please contact the support team.
                </p>
              );
            }

            const hint = fieldHint(field);

            return (
              <Form.Field
                key={field._id}
                control={form.control}
                name={field._id}
                render={({ field: control }) => (
                  <Form.Item>
                    <Form.Label
                      className="text-[13px] font-medium text-ink"
                      variant="peer"
                    >
                      {fieldLabel(field)}
                      {field.isRequired ? (
                        <span aria-hidden="true" className="ml-1 text-danger">
                          *
                        </span>
                      ) : null}
                    </Form.Label>
                    <Form.Control>
                      <FormFieldControl
                        field={field}
                        value={control.value}
                        onChange={control.onChange}
                      />
                    </Form.Control>
                    {hint ? <Form.Description>{hint}</Form.Description> : null}
                    <Form.Message />
                  </Form.Item>
                )}
              />
            );
          })}

          {error ? (
            <p
              role="alert"
              className="flex items-start gap-2 rounded-lg bg-danger-soft px-3.5 py-2.5 text-[13px] leading-relaxed text-danger"
            >
              <Icon name="alert" size={15} className="mt-px shrink-0" />
              Something went wrong submitting the form: {error.message}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-subtle px-5 py-3.5 sm:px-7">
          <p className="text-xs text-muted-foreground">
            <span aria-hidden="true" className="text-danger">
              *
            </span>{' '}
            marks a required field.
          </p>
          <Button type="submit" disabled={loading}>
            <Icon name="send" size={15} />
            {loading
              ? 'Submitting…'
              : definition.buttonText?.trim() || 'Submit'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
