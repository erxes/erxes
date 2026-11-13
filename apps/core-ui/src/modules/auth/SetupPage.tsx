import { currencyOfCountry, NewPassword } from '@erxes/core-contract';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Form, Input, Spinner } from 'erxes-ui';
import { useForm, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { CountrySelect, CurrencySelect } from '~/components/RegionSelect';
import { isApiError, messageOf, orpc } from '~/lib/api';
import { useSignedIn } from '~/modules/auth/session';
import { AuthBanner, AuthenticationLayout } from './components/AuthenticationLayout';

const schema = z
  .object({
    organizationName: z.string().trim().min(1, 'Enter the organization name').max(100),
    country: z.string(),
    currency: z.string(),
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

const LABEL_CLASS_NAME = 'font-sans text-sm font-medium normal-case leading-none text-foreground';

const Field = ({
  name,
  label,
  type = 'text',
  autoComplete,
}: {
  name: keyof Values;
  label: string;
  type?: string;
  autoComplete?: string;
}) => (
  <Form.Field
    name={name}
    render={({ field }) => (
      <Form.Item>
        <Form.Label className={LABEL_CLASS_NAME}>{label}</Form.Label>
        <Form.Control>
          <Input {...field} type={type} autoComplete={autoComplete} />
        </Form.Control>
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
            <Form.Label className={LABEL_CLASS_NAME}>{t('country', 'Country')}</Form.Label>
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
            <Form.Label className={LABEL_CLASS_NAME}>{t('currency', 'Currency')}</Form.Label>
            <Form.Control>
              <CurrencySelect value={field.value} onChange={field.onChange} />
            </Form.Control>
          </Form.Item>
        )}
      />
    </div>
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
  const setup = useSetup();

  const form = useForm<Values>({
    resolver: zodResolver(schema),
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
          <form
            onSubmit={(event) => void onSubmit(event)}
            className="mx-auto grid w-full gap-5"
            noValidate
          >
            <Field name="organizationName" label="Organization name" autoComplete="organization" />
            <RegionFields />
            <div className="grid grid-cols-2 gap-3">
              <Field name="firstName" label="First name" autoComplete="given-name" />
              <Field name="lastName" label="Last name" autoComplete="family-name" />
            </div>
            <Field name="email" label="Email" type="email" autoComplete="email" />
            <Field name="password" label="Password" type="password" autoComplete="new-password" />
            <Field
              name="confirmPassword"
              label="Confirm password"
              type="password"
              autoComplete="new-password"
            />
            {setup.isError && (
              <p role="alert" className="text-center text-sm text-destructive">
                {messageOf(setup.error)}
              </p>
            )}
            <Button type="submit" className="h-8" disabled={setup.isPending}>
              {setup.isPending && <Spinner size="sm" />}
              Create owner
            </Button>
          </form>
        </Form>
      </AuthenticationLayout>
    </div>
  );
};
