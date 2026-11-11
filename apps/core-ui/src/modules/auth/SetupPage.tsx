import { NewPassword } from '@erxes/core-contract';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { Button, Form, Input, Spinner } from 'erxes-ui';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { api, isApiError } from '~/lib/api';
import { SESSION_KEY, SETUP_KEY } from '~/modules/auth/session';
import { AuthBanner, AuthenticationLayout } from './components/AuthenticationLayout';

const schema = z
  .object({
    organizationName: z.string().trim().min(1, 'Enter the organization name').max(100),
    firstName: z.string().trim().min(1, 'Enter your first name').max(100),
    lastName: z.string().trim().max(100),
    email: z.string().trim().email('Enter a valid email'),
    password: NewPassword,
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'The passwords do not match',
    path: ['confirmPassword'],
  });

type Values = z.infer<typeof schema>;

const Field = ({
  name,
  label,
  type = 'text',
  autoComplete,
  autoFocus,
}: {
  name: keyof Values;
  label: string;
  type?: string;
  autoComplete?: string;
  autoFocus?: boolean;
}) => (
  <Form.Field
    name={name}
    render={({ field }) => (
      <Form.Item>
        <Form.Label className="font-sans text-sm font-medium normal-case leading-none text-foreground">
          {label}
        </Form.Label>
        <Form.Control>
          <Input {...field} type={type} autoComplete={autoComplete} autoFocus={autoFocus} />
        </Form.Control>
        <Form.Message />
      </Form.Item>
    )}
  />
);

/**
 * First run (old core-ui "Initial Configuration Steps"): the database has no
 * organisation yet, so the first visitor creates it and becomes its owner.
 */
export const SetupPage = () => {
  const client = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      organizationName: '',
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = form.handleSubmit(async ({ confirmPassword, lastName, ...values }) => {
    setError(null);

    try {
      const session = await api.auth.setup({ ...values, lastName: lastName || undefined });

      client.setQueryData(SETUP_KEY, { required: false });
      client.setQueryData(SESSION_KEY, session);
    } catch (caught) {
      if (isApiError(caught, 'SETUP_DONE')) {
        // Someone finished setup first: go to sign-in.
        void client.invalidateQueries({ queryKey: SETUP_KEY });
      }

      setError(caught instanceof Error ? caught.message : 'Could not finish the setup');
    }
  });

  return (
    <div className="z-10 flex min-h-screen w-full">
      <AuthBanner />
      <AuthenticationLayout>
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="text-xl font-semibold leading-none">Initial Configuration Steps</div>
          <div className="text-accent-foreground">
            Please fill out the following form to complete your installation
          </div>
        </div>
        <Form {...form}>
          <form onSubmit={onSubmit} className="mx-auto grid w-full gap-5" noValidate>
            <Field name="organizationName" label="Organization name" autoComplete="organization" autoFocus />
            <div className="grid grid-cols-2 gap-3">
              <Field name="firstName" label="First name" autoComplete="given-name" />
              <Field name="lastName" label="Last name" autoComplete="family-name" />
            </div>
            <Field name="email" label="Email" type="email" autoComplete="email" />
            <Field name="password" label="Password" type="password" autoComplete="new-password" />
            <Field name="confirmPassword" label="Confirm password" type="password" autoComplete="new-password" />
            {error && (
              <p role="alert" className="text-center text-sm text-destructive">
                {error}
              </p>
            )}
            <Button type="submit" className="h-8" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && <Spinner size="sm" />}
              Create owner
            </Button>
          </form>
        </Form>
      </AuthenticationLayout>
    </div>
  );
};
