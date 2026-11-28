import { useMutation, useQuery } from '@tanstack/react-query';
import { Button, Spinner } from 'erxes-ui';
import { type SubmitEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { orpc } from '@erxes/core-contract/client';
import { AuthField, AuthForm, ErrorLine } from './components/AuthParts';
import { useSignedIn } from './session';

/** A plugin that signs members in with their account in another system (a company directory). */
export type Provider = Awaited<
  ReturnType<typeof orpc.auth.signInProviders.call>
>['providers'][number];

/** The other ways in, under the email form: a button per sign-in provider, nothing without one. */
export const ProviderButtons = ({ onPick }: { onPick: (provider: Provider) => void }) => {
  const { t } = useTranslation('common', { keyPrefix: 'auth' });
  const { data } = useQuery(orpc.auth.signInProviders.queryOptions({ input: {} }));

  if (!data?.providers.length) return null;

  return (
    <div className="mx-auto grid w-full gap-3">
      <p className="text-center text-xs text-muted-foreground">{t('or', 'OR')}</p>
      {data.providers.map((provider) => (
        <Button
          key={provider.plugin}
          type="button"
          variant="outline"
          className="h-8"
          onClick={() => onPick(provider)}
        >
          {provider.label}
        </Button>
      ))}
    </div>
  );
};

/** The login and password of the member's account there; the provider checks them. */
export const ProviderSignInForm = ({
  provider,
  onBack,
  onChallenge,
}: {
  provider: Provider;
  onBack: () => void;
  onChallenge: (challenge: string) => void;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'auth' });
  const signedIn = useSignedIn();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const signIn = useMutation(
    orpc.auth.signInWithProvider.mutationOptions({
      onSuccess: (result) =>
        'challenge' in result ? onChallenge(result.challenge) : signedIn(result),
    }),
  );

  const submit = (event: SubmitEvent) => {
    event.preventDefault();
    setSubmitted(true);

    if (!login.trim() || !password) return;

    signIn.mutate({ plugin: provider.plugin, login: login.trim(), password });
  };

  return (
    <AuthForm onSubmit={submit} className="mx-auto grid w-full gap-4">
      <p className="text-center text-sm font-medium">{provider.label}</p>
      <AuthField
        label={t('provider-login', 'Username or email')}
        value={login}
        autoComplete="username"
        onChange={setLogin}
        error={submitted && !login.trim() && t('provider-login-required', 'Enter your username')}
      />
      <AuthField
        label={t('password')}
        type="password"
        value={password}
        autoComplete="current-password"
        onChange={setPassword}
        error={submitted && !password && t('enter-your-password')}
      />
      <ErrorLine error={signIn.error} />
      <Button type="submit" className="h-8" disabled={signIn.isPending}>
        {signIn.isPending && <Spinner size="sm" />}
        {t('sign-in')}
      </Button>
      <button
        type="button"
        className="text-sm text-muted-foreground hover:underline"
        onClick={onBack}
      >
        {t('back', 'Back')}
      </button>
    </AuthForm>
  );
};
