import { currencyOfCountry, NewPassword } from '@erxes/core-contract';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Form, Input, Spinner } from 'erxes-ui';
import { useForm, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { CountrySelect, CurrencySelect } from '~/components/RegionSelect';
import { isApiError, messageOf, orpc } from '@erxes/core-contract/client';
import { useSignedIn } from '~/modules/auth/session';
import { AuthForm, AuthShell } from './components/AuthParts';

type Translate = (key: string, defaultValue: string) => string;

const setupSchema = (t: Translate) =>
  z
    .object({
      organizationName: z
        .string()
        .trim()
        .min(1, t('organization-required', 'Enter the organization name'))
        .max(100),
      country: z.string(),
      currency: z.string(),
      firstName: z
        .string()
        .trim()
        .min(1, t('first-name-required', 'Enter your first name'))
        .max(100),
      lastName: z.string().trim().max(100),
      email: z
        .string()
        .trim()
        .check(z.email(t('email-invalid', 'Enter your email, like name@example.com'))),
      password: NewPassword,
      confirmPassword: z.string(),
    })
    .refine((values) => values.password === values.confirmPassword, {
      path: ['confirmPassword'],
      error: t('password-mismatch', "The passwords don't match"),
    });

type Values = z.infer<ReturnType<typeof setupSchema>>;

const Field = ({
  name,
  label,
  type = 'text',
  autoComplete,
  required,
  hint,
}: {
  name: keyof Values;
  label: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
  /** What the field takes, under it until it has an error. */
  hint?: string;
}) => (
  <Form.Field
    name={name}
    render={({ field, fieldState }) => (
      <Form.Item>
        <Form.Label variant="plain" required={required}>
          {label}
        </Form.Label>
        <Form.Control>
          <Input {...field} type={type} autoComplete={autoComplete} />
        </Form.Control>
        {hint && !fieldState.error && <Form.Description>{hint}</Form.Description>}
        <Form.Message />
      </Form.Item>
    )}
  />
);

/** Where the organisation works; choosing a country also picks its currency, still editable. */
const RegionFields = () => {
  const { t } = useTranslation('common', { keyPrefix: 'region' });
  const { control, setValue } = useFormContext<Values>();

  return (
    <div className="grid grid-cols-2 gap-3">
      <Form.Field
        control={control}
        name="country"
        render={({ field }) => (
          <Form.Item>
            <Form.Label variant="plain">{t('country', 'Country')}</Form.Label>
            <Form.Control>
              <CountrySelect
                value={field.value}
                onChange={(country) => {
                  field.onChange(country);
                  setValue('currency', currencyOfCountry(country) ?? '');
                }}
              />
            </Form.Control>
          </Form.Item>
        )}
      />
      <Form.Field
        control={control}
        name="currency"
        render={({ field }) => (
          <Form.Item>
            <Form.Label variant="plain">{t('currency', 'Currency')}</Form.Label>
            <Form.Control>
              <CurrencySelect value={field.value} onChange={field.onChange} />
            </Form.Control>
          </Form.Item>
        )}
      />
    </div>
  );
};

/** The owner's name, email and password. */
const OwnerFields = () => {
  const { t } = useTranslation('common', { keyPrefix: 'auth.setup' });

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <Field
          name="firstName"
          label={t('first-name', 'First name')}
          autoComplete="given-name"
          required
        />
        <Field name="lastName" label={t('last-name', 'Last name')} autoComplete="family-name" />
      </div>
      <Field name="email" label={t('email', 'Email')} type="email" autoComplete="email" required />
      <Field
        name="password"
        label={t('password', 'Password')}
        type="password"
        autoComplete="new-password"
        required
        hint={t(
          'password-rule',
          'At least 8 characters, with a lower-case and an upper-case letter and a digit.',
        )}
      />
      <Field
        name="confirmPassword"
        label={t('confirm-password', 'Repeat password')}
        type="password"
        autoComplete="new-password"
        required
      />
    </>
  );
};

/** Creates the organisation and its owner, then signs in. */
const useSetup = () => {
  const client = useQueryClient();
  const signedIn = useSignedIn();

  return useMutation(
    orpc.auth.setup.mutationOptions({
      onSuccess: (session) => {
        client.setQueryData(orpc.auth.setupStatus.queryKey(), { required: false });
        signedIn(session);
      },
      onError: (error) => {
        // Someone finished setup first: go to sign-in.
        if (isApiError(error, 'SETUP_DONE')) {
          void client.invalidateQueries({ queryKey: orpc.auth.setupStatus.key() });
        }
      },
    }),
  );
};

/**
 * First run: the database has no
 * organisation yet, so the first visitor creates it and becomes its owner.
 */
export const SetupPage = () => {
  const { t } = useTranslation('common', { keyPrefix: 'auth.setup' });
  const setup = useSetup();

  const form = useForm<Values>({
    resolver: zodResolver(setupSchema(t)),
    defaultValues: {
      organizationName: '',
      country: '',
      currency: '',
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = form.handleSubmit(
    ({ confirmPassword, lastName, country, currency, ...values }) =>
      setup.mutate({
        ...values,
        lastName: lastName || undefined,
        country: country || undefined,
        currency: currency || undefined,
      }),
  );

  return (
    <AuthShell
      title={t('title', 'Set up erxes')}
      subtitle={t('subtitle', 'Create your organization and its owner account to get started.')}
    >
      <Form {...form}>
        <AuthForm onSubmit={(event) => void onSubmit(event)} className="mx-auto grid w-full gap-5">
          <Field
            name="organizationName"
            label={t('organization', 'Organization name')}
            autoComplete="organization"
            required
          />
          <RegionFields />
          <OwnerFields />
          {setup.isError && (
            <p role="alert" className="text-center text-sm text-destructive-text">
              {messageOf(setup.error)}
            </p>
          )}
          <Button type="submit" className="h-8" disabled={setup.isPending}>
            {setup.isPending && <Spinner size="sm" />}
            {t('submit', 'Create organization')}
          </Button>
        </AuthForm>
      </Form>
    </AuthShell>
  );
};
