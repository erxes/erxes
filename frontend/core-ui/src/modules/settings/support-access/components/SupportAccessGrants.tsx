import { IconCheck, IconLogout, IconX } from '@tabler/icons-react';
import { Button, Spinner } from 'erxes-ui';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { SupportAccessGrantRow } from '@/settings/support-access/components/SupportAccessGrantRow';
import {
  useSupportAccessGrants,
  useSupportGrantRowActions,
} from '@/settings/support-access/hooks/useSupportAccessGrants';
import { ISupportGrant } from '@/settings/support-access/types';

const GrantSection = ({
  title,
  empty,
  grants,
  actions,
}: {
  title: string;
  empty: string;
  grants: ISupportGrant[];
  actions?: (grant: ISupportGrant) => ReactNode;
}) => (
  <section className="flex flex-col gap-3">
    <h3 className="text-base font-semibold">{title}</h3>
    {grants.length ? (
      <ul className="flex flex-col gap-2">
        {grants.map((grant) => (
          <SupportAccessGrantRow key={grant._id} grant={grant}>
            {actions?.(grant)}
          </SupportAccessGrantRow>
        ))}
      </ul>
    ) : (
      <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
        {empty}
      </p>
    )}
  </section>
);

export const SupportAccessGrants = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'support-access' });
  const { pending, active, history, loading, error } = useSupportAccessGrants({
    poll: true,
  });
  const { openApprove, confirmDeny, confirmRevoke, busy } =
    useSupportGrantRowActions();

  if (loading) return <Spinner />;

  if (error) {
    return <p className="text-sm text-destructive">{error.message}</p>;
  }

  return (
    <>
      <GrantSection
        title={t('requests')}
        empty={t('requests-empty')}
        grants={pending}
        actions={(grant) => (
          <div className="flex shrink-0 gap-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={busy}
              onClick={() => confirmDeny(grant)}
            >
              <IconX /> {t('deny')}
            </Button>
            <Button size="sm" disabled={busy} onClick={() => openApprove(grant)}>
              <IconCheck /> {t('approve')}
            </Button>
          </div>
        )}
      />
      <GrantSection
        title={t('active')}
        empty={t('active-empty')}
        grants={active}
        actions={(grant) => (
          <Button
            variant="destructive"
            size="sm"
            className="shrink-0"
            disabled={busy}
            onClick={() => confirmRevoke(grant)}
          >
            <IconLogout /> {t('revoke')}
          </Button>
        )}
      />
      <GrantSection
        title={t('history')}
        empty={t('history-empty')}
        grants={history}
      />
    </>
  );
};
