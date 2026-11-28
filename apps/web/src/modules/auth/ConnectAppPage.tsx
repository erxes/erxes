import { skipToken, useMutation, useQuery } from '@tanstack/react-query';
import { Button, Spinner } from 'erxes-ui';
import { useQueryState } from 'nuqs';
import { useTranslation } from 'react-i18next';
import { orpc } from '@erxes/core-contract/client';
import { AuthShell, ErrorLine } from './components/AuthParts';

/**
 * An app such as Claude asks to act as the member through the MCP server: they allow or refuse
 * it here, then go back to the app. `/core/v1/oauth/authorize` sends them with its signed request.
 */
export const ConnectAppPage = () => {
  const { t } = useTranslation('common', { keyPrefix: 'connect' });
  const [request] = useQueryState('request');

  const consent = useQuery(
    orpc.oauthConsent.get.queryOptions({ input: request ? { request } : skipToken, retry: false }),
  );

  const decide = useMutation(
    orpc.oauthConsent.decide.mutationOptions({
      onSuccess: ({ redirectTo }) => window.location.assign(redirectTo),
    }),
  );

  if (!request) {
    return (
      <AuthShell title={t('missing')}>
        <span />
      </AuthShell>
    );
  }

  if (consent.isPending) {
    return (
      <div className="flex h-svh items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (consent.isError) {
    return (
      <AuthShell title={t('failed')}>
        <ErrorLine error={consent.error} />
      </AuthShell>
    );
  }

  const { app, address, redirectHost, organisation } = consent.data;
  const answering = decide.isPending || decide.isSuccess;

  return (
    <AuthShell title={t('title', { app })} subtitle={t('subtitle', { organisation })}>
      <div className="flex flex-col gap-3 text-sm">
        <p>{t('can')}</p>
        <p className="text-muted-foreground">
          {address ? t('verified', { address }) : t('unverified')}
        </p>
        <p className="text-muted-foreground">{t('returns-to', { host: redirectHost })}</p>
      </div>
      <ErrorLine error={decide.error} />
      <div className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1"
          disabled={answering}
          onClick={() => decide.mutate({ request, allow: false })}
        >
          {t('deny')}
        </Button>
        <Button
          className="flex-1"
          disabled={answering}
          onClick={() => decide.mutate({ request, allow: true })}
        >
          {t('allow')}
        </Button>
      </div>
    </AuthShell>
  );
};
