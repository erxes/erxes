import type { EmailSettings } from '@erxes/core-contract';
import { messageOf, orpc } from '@erxes/core-contract/client';
import { IconRefresh } from '@tabler/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Badge, Button, Spinner, useFormat, useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { OverviewSection } from '../integrations/IntegrationLayout';

/** Asks SendGrid or SES again which domains it sends from; every email query shows the answer. */
export const useCheckDomains = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.email' });
  const { toast } = useToast();
  const client = useQueryClient();

  return useMutation(
    orpc.emails.checkDomains.mutationOptions({
      onSuccess: () => client.invalidateQueries({ queryKey: orpc.emails.key() }),
      onError: (error) =>
        toast({
          variant: 'destructive',
          title: t('domains-check-failed', 'Could not check the domains'),
          description: messageOf(error),
        }),
    }),
  );
};

/**
 * The domains the provider verified: broadcasts and automations may send from any address on
 * them. When it last answered, what it said when it couldn't, and Check again.
 */
export const VerifiedDomains = ({ saved }: { saved: EmailSettings }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.email' });
  const fmt = useFormat();
  const check = useCheckDomains();

  return (
    <OverviewSection title={t('domains', 'Verified domains')}>
      <div className="space-y-3 rounded-lg border p-4 text-sm">
        {saved.verifiedDomains.length ? (
          <div className="flex flex-wrap gap-1.5">
            {saved.verifiedDomains.map((domain) => (
              <Badge key={domain} variant="secondary">
                {domain}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">
            {t('domains-none', 'None yet: emails go out only from {{address}}.', {
              address: saved.fromEmail,
            })}
          </p>
        )}
        {saved.domainsError && (
          <p className="text-destructive-text">
            {t('domains-error', 'The last check failed: {{error}}', { error: saved.domainsError })}
          </p>
        )}
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            {saved.domainsCheckedAt
              ? t(
                  'domains-checked',
                  'Checked {{when}}. Any address on these domains can be a From.',
                  {
                    when: fmt.dateTime(saved.domainsCheckedAt),
                  },
                )
              : t('domains-unchecked', 'Not checked yet.')}
          </p>
          <Button
            variant="secondary"
            size="sm"
            disabled={check.isPending}
            onClick={() => check.mutate({})}
          >
            {check.isPending ? <Spinner size="sm" /> : <IconRefresh />}
            {t('domains-check', 'Check again')}
          </Button>
        </div>
      </div>
    </OverviewSection>
  );
};
