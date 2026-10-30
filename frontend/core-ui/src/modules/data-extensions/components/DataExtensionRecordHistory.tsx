import { gql, useQuery } from '@apollo/client';
import { IconHistory } from '@tabler/icons-react';
import { Skeleton } from 'erxes-ui';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DataExtensionValue,
  formatDataExtensionValue,
  IDataExtensionField,
  useUsers,
} from 'ui-modules';

const DATA_EXTENSION_CHANGES = gql`
  query DataExtensionChanges($recordType: String!, $recordId: String!, $limit: Int) {
    dataExtensionChanges(recordType: $recordType, recordId: $recordId, limit: $limit) {
      _id
      key
      before
      after
      event
      userId
      createdAt
    }
  }
`;

interface IChange {
  _id: string;
  key: string;
  before: unknown;
  after: unknown;
  event: 'created' | 'updated';
  userId: string;
  createdAt: string;
}

const relativeTime = (iso: string, locale: string) => {
  const seconds = Math.round((new Date(iso).getTime() - Date.now()) / 1000);
  const format = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const steps: [Intl.RelativeTimeFormatUnit, number][] = [
    ['second', 60],
    ['minute', 60],
    ['hour', 24],
    ['day', 30],
    ['month', 12],
  ];
  let value = seconds;

  for (const [unit, size] of steps) {
    if (Math.abs(value) < size) {
      return format.format(value, unit);
    }

    value = Math.round(value / size);
  }

  return format.format(value, 'year');
};

/**
 * Who changed which value of a record, newest first, from the history the
 * server records on every write. Author names come from one users query.
 */
export const DataExtensionRecordHistory = ({
  recordType,
  recordId,
  fields,
  version,
}: {
  recordType: string;
  recordId: string;
  fields: IDataExtensionField[];
  /** Bumped by the parent after a save, to show the new entry. */
  version?: number;
}) => {
  const { t, i18n } = useTranslation('dataExtensions');
  const { data, loading, refetch } = useQuery<{
    dataExtensionChanges: IChange[];
  }>(DATA_EXTENSION_CHANGES, {
    variables: { recordType, recordId, limit: 30 },
    fetchPolicy: 'network-only',
  });

  useEffect(() => {
    if (version) {
      refetch();
    }
  }, [version, refetch]);
  const changes = data?.dataExtensionChanges || [];
  const userIds = useMemo(
    () => Array.from(new Set(changes.map((change) => change.userId))),
    [changes],
  );
  const { users } = useUsers({
    variables: { ids: userIds },
    skip: !userIds.length,
  });
  const nameOf = (userId: string) => {
    const user = users.find((candidate) => candidate._id === userId);

    return user?.details?.fullName || user?.email || t('history.someone');
  };
  const fieldOf = (key: string) => fields.find((field) => field.key === key);
  const show = (field: IDataExtensionField | undefined, value: unknown) => {
    if (value === null || value === undefined) {
      return t('history.empty');
    }

    if (typeof value === 'object' && (value as { truncated?: boolean }).truncated) {
      return t('history.large');
    }

    if (!field || field.relation || field.type === 'member') {
      return Array.isArray(value)
        ? t('history.linked', { count: value.length })
        : t('history.linked', { count: 1 });
    }

    return (
      formatDataExtensionValue(field, value as DataExtensionValue, {
        locale: i18n.language,
      }) || t('history.empty')
    );
  };

  return (
    <section className="flex flex-col gap-2" aria-label={t('history.title')}>
      <h4 className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <IconHistory className="size-3.5" aria-hidden="true" />
        {t('history.title')}
      </h4>
      {loading && !changes.length ? (
        <Skeleton className="h-10 w-full" />
      ) : !changes.length ? (
        <p className="text-xs text-muted-foreground">{t('history.none')}</p>
      ) : (
        <ol className="flex flex-col gap-2 border-l pl-3">
          {changes.map((change) => {
            const field = fieldOf(change.key);
            const label = field?.label || change.key;

            return (
              <li key={change._id} className="text-xs">
                <p>
                  <span className="font-medium">{nameOf(change.userId)}</span>{' '}
                  {change.event === 'created'
                    ? t('history.set', { label, value: show(field, change.after) })
                    : t('history.changed', {
                        label,
                        from: show(field, change.before),
                        to: show(field, change.after),
                      })}
                </p>
                <time
                  dateTime={change.createdAt}
                  title={new Date(change.createdAt).toLocaleString(i18n.language)}
                  className="text-muted-foreground"
                >
                  {relativeTime(change.createdAt, i18n.language)}
                </time>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
};
