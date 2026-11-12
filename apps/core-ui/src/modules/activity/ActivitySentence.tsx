import type { Activity, ActivityTarget } from '@erxes/core-contract';
import { Skeleton } from 'erxes-ui';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import type { Lookups } from '~/components/ChangeList';
import { isApiError } from '~/lib/api';
import { useCompany } from '~/modules/contacts/companies/useCompanies';
import { companyTitle, customerTitle } from '~/modules/contacts/components/ContactPicker';
import { useCustomer } from '~/modules/contacts/customers/useCustomers';
import {
  readCompanyLink,
  readCustomerLink,
  readLead,
  readMerged,
  readTagged,
  verbOf,
} from './activityData';

const isActivityTarget = (type: string): type is ActivityTarget =>
  type === 'customer' || type === 'company';

/** The name as it is now; until it loads (or after a deletion), the name saved with the entry. */
const CoreRecord = ({
  type,
  id,
  fallback,
}: {
  type: ActivityTarget;
  id: string;
  fallback?: string;
}) => {
  const customer = useCustomer(type === 'customer' ? id : null);
  const company = useCompany(type === 'company' ? id : null);
  const query = type === 'customer' ? customer : company;
  let name: string | null = null;

  if (customer.data) name = customerTitle(customer.data);
  else if (company.data) name = companyTitle(company.data);

  if (query.isPending) {
    return fallback ? (
      <span className="font-medium">{fallback}</span>
    ) : (
      <Skeleton className="inline-block h-3.5 w-20 align-middle" />
    );
  }

  if (query.isError) {
    const deleted = isApiError(query.error) && query.error.status === 404;

    return (
      <span
        className="text-muted-foreground"
        title={deleted ? `Deleted ${type}` : query.error.message}
      >
        {fallback ?? (deleted ? `a deleted ${type}` : id)}
      </span>
    );
  }

  return (
    <Link
      className="font-medium hover:underline"
      to={`/contacts/${type === 'customer' ? 'customers' : 'companies'}/${id}`}
    >
      {name || id}
    </Link>
  );
};

/** A linked customer or company by name, opening its page; deleted ones say so. */
export const LinkedRecord = ({
  type,
  id,
  fallback,
}: {
  type: string;
  id: string;
  fallback?: string;
}) => {
  if (!isActivityTarget(type)) {
    return (
      <span className="font-medium">
        {type} {id}
      </span>
    );
  }

  return <CoreRecord type={type} id={id} fallback={fallback || undefined} />;
};

const Stage = ({ stage }: { stage: { name?: string; color?: string } | null | undefined }) =>
  stage ? (
    <span className="inline-flex items-center gap-1 font-medium">
      <span className="size-2 rounded-full" style={{ background: stage.color }} />
      {stage.name}
    </span>
  ) : null;

type Translate = (key: string, fallback: string) => string;

const TaggedSentence = ({ activity, lookups, t }: SentenceProps & { t: Translate }) => {
  const { added = [], removed = [] } = readTagged(activity) ?? {};

  const names = (ids: string[]) =>
    ids.map((id) => lookups.tags.get(id)?.name ?? 'a deleted tag').join(', ');

  return (
    <>
      {added.length > 0 && (
        <>
          {t('added-tags', 'added')} <span className="font-medium">{names(added)}</span>
        </>
      )}
      {added.length > 0 && removed.length > 0 && ` ${t('and', 'and')} `}
      {removed.length > 0 && (
        <>
          {t('removed-tags', 'removed')} <span className="font-medium">{names(removed)}</span>
        </>
      )}
    </>
  );
};

const LeadSentence = ({ activity, t }: { activity: Activity; t: Translate }) => {
  const lead = readLead(activity);

  if (lead?.event === 'converted')
    return <>{t('lead-converted', 'converted the lead to a customer')}</>;

  return (
    <>
      {lead?.event === 'reopened'
        ? t('lead-reopened', 'made them a lead again, at')
        : t('lead-moved', 'moved the lead to')}{' '}
      <Stage stage={lead?.to} />
      {lead?.reason && <span className="text-muted-foreground"> · {lead.reason}</span>}
    </>
  );
};

interface SentenceProps {
  activity: Activity;
  lookups: Lookups;
}

/** What a core entry says after its actor: "created this customer", "added VIP", … */
const Predicate = ({ activity, lookups }: SentenceProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'activity' });
  const verb = verbOf(activity);

  const record = isActivityTarget(activity.targetType)
    ? t(`this-${activity.targetType}`, `this ${activity.targetType}`)
    : t('this-record', 'this record');

  switch (verb) {
    case 'created':
    case 'updated':
      return <>{`${t(verb, verb)} ${record}`}</>;
    case 'tagged':
      return <TaggedSentence activity={activity} lookups={lookups} t={t} />;
    case 'merged':
      return (
        <>
          {t('merged', 'merged')}{' '}
          <span className="font-medium">
            {(readMerged(activity)?.mergedNames ?? []).join(', ')}
          </span>{' '}
          {t('into', 'into')} {record}
        </>
      );
    case 'company_linked':
    case 'company_unlinked':
    case 'customer_linked':
    case 'customer_unlinked':
      return <LinkSentence activity={activity} verb={verb} t={t} />;
    case 'lead':
      return <LeadSentence activity={activity} t={t} />;
    default:
      return <>· {activity.type}</>;
  }
};

const LinkSentence = ({
  activity,
  verb,
  t,
}: {
  activity: Activity;
  verb: string;
  t: Translate;
}) => {
  const company = readCompanyLink(activity);
  const customer = readCustomerLink(activity);
  let linked: ReactNode = null;

  if (verb.startsWith('company') && company) {
    linked = <LinkedRecord type="company" id={company.companyId} fallback={company.companyName} />;
  } else if (customer) {
    linked = (
      <LinkedRecord type="customer" id={customer.customerId} fallback={customer.customerName} />
    );
  }

  return (
    <>
      {verb.endsWith('_unlinked') ? t('unlinked', 'unlinked') : t('linked', 'linked')} {linked}
    </>
  );
};

/** One line about a core entry: who did what; plugin entries bring their own summary. */
export const Sentence = ({ activity, actor, lookups }: SentenceProps & { actor: string }) => {
  if (activity.source !== 'core') return <>{activity.summary}</>;

  return (
    <>
      <span className="font-medium">{actor}</span>{' '}
      <Predicate activity={activity} lookups={lookups} />
    </>
  );
};
