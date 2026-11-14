import type { Activity, ActivityTarget } from '@erxes/core-contract';
import { Skeleton } from 'erxes-ui';
import type { ReactElement } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import type { Lookups } from '~/components/ChangeList';
import { isApiError } from '~/lib/api';
import { useCompany } from '~/modules/contacts/companies/useCompanies';
import { companyTitle, customerTitle } from '~/modules/contacts/components/ContactPicker';
import { useCustomer } from '~/modules/contacts/customers/useCustomers';
import { useStageName } from '~/modules/leads/i18n';
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
  const { t } = useTranslation('common', { keyPrefix: 'activity' });
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
      <span className="text-muted-foreground" title={deleted ? undefined : query.error.message}>
        {fallback ?? (deleted ? t('deleted', { context: type }) : id)}
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

/** The stage as the board names it: default stages translated, the organisation's own as written. */
const Stage = ({ stage }: { stage: { name?: string; color?: string } | null | undefined }) => {
  const stageName = useStageName();

  return stage ? (
    <span className="inline-flex items-center gap-1 font-medium">
      <span
        className="size-2 rounded-full bg-(--stage-color)"
        style={{ '--stage-color': stage.color }}
      />
      {stageName(stage.name)}
    </span>
  ) : (
    <></>
  );
};

/**
 * One whole sentence from `activity.sentence.<name>`, so each language puts the actor, the verb
 * and the record in its own order. `<b>` marks names; `components` places links and chips.
 */
export const SentenceLine = ({
  name,
  context,
  values,
  components,
}: {
  name: string;
  context?: string;
  values?: Record<string, string>;
  components?: Record<string, ReactElement>;
}) => {
  const { t } = useTranslation('common');

  return (
    <Trans
      t={t}
      i18nKey={`activity.sentence.${name}`}
      context={context}
      values={values}
      components={{ b: <span className="font-medium" />, ...components }}
    />
  );
};

interface SentenceProps {
  activity: Activity;
  actor: string;
  lookups: Lookups;
}

const TaggedSentence = ({ activity, actor, lookups }: SentenceProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'activity' });
  const { added = [], removed = [] } = readTagged(activity) ?? {};

  const names = (ids: string[]) =>
    ids.map((id) => lookups.tags.get(id)?.name ?? t('deleted-tag')).join(', ');

  let name = 'tags-changed';

  if (!removed.length) name = 'tags-added';
  else if (!added.length) name = 'tags-removed';

  return (
    <SentenceLine name={name} values={{ actor, added: names(added), removed: names(removed) }} />
  );
};

const LeadSentence = ({ activity, actor }: { activity: Activity; actor: string }) => {
  const lead = readLead(activity);

  if (lead?.event === 'converted') return <SentenceLine name="lead-converted" values={{ actor }} />;

  return (
    <>
      <SentenceLine
        name={lead?.event === 'reopened' ? 'lead-reopened' : 'lead-moved'}
        values={{ actor }}
        components={{ stage: <Stage stage={lead?.to} /> }}
      />
      {lead?.reason && <span className="text-muted-foreground"> · {lead.reason}</span>}
    </>
  );
};

const LinkSentence = ({
  activity,
  actor,
  verb,
}: {
  activity: Activity;
  actor: string;
  verb: string;
}) => {
  const company = readCompanyLink(activity);
  const customer = readCustomerLink(activity);
  let linked = <></>;

  if (verb.startsWith('company') && company) {
    linked = <LinkedRecord type="company" id={company.companyId} fallback={company.companyName} />;
  } else if (customer) {
    linked = (
      <LinkedRecord type="customer" id={customer.customerId} fallback={customer.customerName} />
    );
  }

  return (
    <SentenceLine
      name={verb.endsWith('_unlinked') ? 'unlinked' : 'linked'}
      values={{ actor }}
      components={{ record: linked }}
    />
  );
};

/** One line about a core entry: who did what; plugin entries bring their own summary. */
export const Sentence = ({ activity, actor, lookups }: SentenceProps) => {
  if (activity.source !== 'core') return <>{activity.summary}</>;

  const verb = verbOf(activity);
  // "this customer", "this company", or "this record" for any other target.
  const context = isActivityTarget(activity.targetType) ? activity.targetType : undefined;

  switch (verb) {
    case 'created':
    case 'updated':
      return <SentenceLine name={verb} context={context} values={{ actor }} />;
    case 'merged':
      return (
        <SentenceLine
          name="merged"
          context={context}
          values={{ actor, names: (readMerged(activity)?.mergedNames ?? []).join(', ') }}
        />
      );
    case 'tagged':
      return <TaggedSentence activity={activity} actor={actor} lookups={lookups} />;
    case 'company_linked':
    case 'company_unlinked':
    case 'customer_linked':
    case 'customer_unlinked':
      return <LinkSentence activity={activity} actor={actor} verb={verb} />;
    case 'lead':
      return <LeadSentence activity={activity} actor={actor} />;
    default:
      return <SentenceLine name="other" values={{ actor, type: activity.type }} />;
  }
};
