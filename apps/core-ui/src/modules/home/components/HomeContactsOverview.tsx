import type { UseQueryResult } from '@tanstack/react-query';
import { IconAddressBook, IconBuilding, IconUserPlus, IconUsers, type TablerIcon } from '@tabler/icons-react';
import { Skeleton } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useContactsOverview } from '../hooks';
import { HOME_NS } from '../i18n';

const Stat = ({
  label,
  icon: Icon,
  query,
  to,
}: {
  label: string;
  icon: TablerIcon;
  query: UseQueryResult<number>;
  to: string;
}) => {
  const { i18n } = useTranslation();

  return (
    <Link
      to={to}
      className="flex min-w-0 items-center gap-3 rounded-lg border border-transparent p-3 transition-colors hover:border-border hover:bg-accent/60"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-5" />
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="truncate text-xs text-muted-foreground">{label}</span>
        {query.isPending ? (
          <Skeleton className="mt-1 h-5 w-12" />
        ) : (
          <span className="text-lg font-semibold leading-tight tabular-nums">
            {query.isError ? '—' : query.data.toLocaleString(i18n.language)}
          </span>
        )}
      </span>
    </Link>
  );
};

/** Record counts of core contacts and the team, each opening its list. */
export const HomeContactsOverview = () => {
  const { t } = useTranslation(HOME_NS);
  const { customers, leads, companies, users } = useContactsOverview();

  return (
    <section className="flex h-full min-w-0 flex-col justify-center overflow-hidden rounded-xl border bg-background p-2 shadow-xs">
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        <Stat label={t('kpi.customers')} icon={IconAddressBook} query={customers} to="/contacts/customers" />
        <Stat label={t('kpi.leads')} icon={IconUserPlus} query={leads} to="/contacts/leads" />
        <Stat label={t('kpi.companies')} icon={IconBuilding} query={companies} to="/contacts/companies" />
        <Stat label={t('kpi.team-members')} icon={IconUsers} query={users} to="/settings/team-members" />
      </div>
    </section>
  );
};
