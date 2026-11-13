import { useMutation, useQuery } from '@tanstack/react-query';
import { Button, Input, Label, Spinner } from 'erxes-ui';
import { type SubmitEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { QueryState } from '~/components/QueryState';
import { messageOf, orpc } from '~/lib/api';

/** Where the sign-in came from: core's customer authorize step, nothing else (no open redirect). */
const AUTHORIZE = '/core/v1/customer-oauth/authorize?';

type Address = { kind: 'email' | 'phone'; value: string };

/** An email address when it has an @, else a phone. */
const addressOf = (text: string): Address => ({
  kind: text.includes('@') ? 'email' : 'phone',
  value: text.trim(),
});

const isAddress = (text: string) => {
  const value = text.trim();

  return value.includes('@')
    ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    : /^\+?[\d\s()-]{6,20}$/.test(value);
};

/** Step two: the 6-digit code sent to the address. */
const CodeStep = ({
  organization,
  address,
  onSignedIn,
  onBack,
}: {
  organization: string;
  address: Address;
  onSignedIn: () => void;
  onBack: () => void;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'customer-sign-in' });
  const [code, setCode] = useState('');
  const signIn = useMutation(orpc.customerAuth.signIn.mutationOptions({ onSuccess: onSignedIn }));
  const resend = useMutation(orpc.customerAuth.sendCode.mutationOptions());
  const error = signIn.error ?? resend.error;

  const submit = (event: SubmitEvent) => {
    event.preventDefault();
    signIn.mutate({ organization, ...address, code });
  };

  return (
    <form onSubmit={submit} className="grid gap-4" noValidate>
      <p className="text-center text-sm text-muted-foreground">
        {t('code-sent', { address: address.value })}
      </p>
      <div className="grid gap-2">
        <Label htmlFor="customer-code">{t('code')}</Label>
        <Input
          id="customer-code"
          value={code}
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="123456"
          onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
          className="text-center font-mono tracking-widest"
        />
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {messageOf(error)}
        </p>
      )}
      {resend.isSuccess && !error && (
        <p className="text-sm text-muted-foreground">{t('code-resent')}</p>
      )}
      <Button type="submit" className="h-9" disabled={signIn.isPending || code.length !== 6}>
        {signIn.isPending ? <Spinner size="sm" /> : t('sign-in')}
      </Button>
      <div className="flex justify-between text-sm text-muted-foreground">
        <button type="button" className="hover:underline" onClick={onBack}>
          {t('other-address')}
        </button>
        <button
          type="button"
          className="hover:underline disabled:opacity-50"
          disabled={resend.isPending}
          onClick={() => resend.mutate({ organization, ...address })}
        >
          {t('resend')}
        </button>
      </div>
    </form>
  );
};

/** Step one: the email address or phone to send a code to. */
const AddressStep = ({
  organization,
  onSent,
}: {
  organization: string;
  onSent: (address: Address) => void;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'customer-sign-in' });
  const [text, setText] = useState('');
  const [touched, setTouched] = useState(false);

  const send = useMutation(
    orpc.customerAuth.sendCode.mutationOptions({ onSuccess: () => onSent(addressOf(text)) }),
  );

  const invalid = touched && !isAddress(text);

  const submit = (event: SubmitEvent) => {
    event.preventDefault();
    setTouched(true);

    if (isAddress(text)) send.mutate({ organization, ...addressOf(text) });
  };

  return (
    <form onSubmit={submit} className="grid gap-4" noValidate>
      <div className="grid gap-2">
        <Label htmlFor="customer-address">{t('address')}</Label>
        <Input
          id="customer-address"
          value={text}
          autoComplete="username"
          placeholder={t('address-placeholder')}
          aria-invalid={invalid}
          onChange={(event) => setText(event.target.value)}
        />
        {invalid && <p className="text-sm text-destructive">{t('address-invalid')}</p>}
      </div>
      {send.isError && (
        <p role="alert" className="text-sm text-destructive">
          {messageOf(send.error)}
        </p>
      )}
      <Button type="submit" className="h-9" disabled={send.isPending}>
        {send.isPending ? <Spinner size="sm" /> : t('send-code')}
      </Button>
      <p className="text-center text-xs text-muted-foreground">{t('no-password')}</p>
    </form>
  );
};

/**
 * Core's sign-in page for customers of the organisation's apps (decision 42):
 * a code by email or SMS, then back to the app through `next`.
 */
export const CustomerSignInPage = () => {
  const { t } = useTranslation('common', { keyPrefix: 'customer-sign-in' });
  const params = new URLSearchParams(window.location.search);
  const organization = params.get('organization') ?? undefined;
  const app = params.get('app');
  const next = params.get('next');
  const [address, setAddress] = useState<Address | null>(null);
  const [done, setDone] = useState(false);
  const config = useQuery(orpc.customerAuth.config.queryOptions({ input: { organization } }));

  const signedIn = () => {
    if (next?.startsWith(AUTHORIZE)) {
      window.location.assign(next);

      return;
    }

    setDone(true);
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-muted/40 px-4 py-10">
      <div className="w-full max-w-sm rounded-xl border bg-background p-6 shadow-sm">
        <QueryState query={config}>
          {({ organization: org }) => (
            <div className="grid gap-6">
              <div className="grid gap-1 text-center">
                <h1 className="text-xl font-semibold">{t('title', { organization: org.name })}</h1>
                {app && (
                  <p className="text-sm text-muted-foreground">{t('to-continue', { app })}</p>
                )}
              </div>
              {done && <output className="text-center text-sm">{t('signed-in')}</output>}
              {!done && address && (
                <CodeStep
                  organization={org.subdomain}
                  address={address}
                  onSignedIn={signedIn}
                  onBack={() => setAddress(null)}
                />
              )}
              {!done && !address && (
                <AddressStep organization={org.subdomain} onSent={setAddress} />
              )}
            </div>
          )}
        </QueryState>
      </div>
    </div>
  );
};
