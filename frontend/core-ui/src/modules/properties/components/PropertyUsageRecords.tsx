import { ContactsPath } from '@/types/paths/ContactsPath';
import { IconExternalLink } from '@tabler/icons-react';
import { Button, Popover, Spinner } from 'erxes-ui';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  formatUsageTotal,
  useFieldValueUsage,
} from '../hooks/useFieldValueUsage';

const CONTACTS = ContactsPath.Index;

// Only record types core can open; others list by name alone.
const RECORD_LINKS: Record<string, (id: string) => string> = {
  'core:customer': (id) =>
    `${CONTACTS}${ContactsPath.Customers}?contactId=${id}`,
  'core:company': (id) =>
    `${CONTACTS}${ContactsPath.Companies}?companyId=${id}`,
};

export const PropertyUsageRecords = ({
  fieldId,
  contentType,
  value,
  children,
}: {
  fieldId: string;
  contentType: string;
  // Lists only the records holding this option.
  value?: string;
  children: ReactNode;
}) => (
  <Popover>
    <Popover.Trigger asChild>{children}</Popover.Trigger>
    <Popover.Content align="end" className="w-72 p-0">
      <PropertyUsageRecordList
        fieldId={fieldId}
        contentType={contentType}
        value={value}
      />
    </Popover.Content>
  </Popover>
);

// Mounts with the popover, so records are fetched only once it opens.
const PropertyUsageRecordList = ({
  fieldId,
  contentType,
  value,
}: {
  fieldId: string;
  contentType: string;
  value?: string;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
  const { usage, counts, loading } = useFieldValueUsage(fieldId, value);
  const toLink = RECORD_LINKS[contentType];

  if (loading) {
    return <Spinner className="p-4" />;
  }

  if (!usage?.known) {
    return (
      <p className="p-3 text-sm text-muted-foreground">
        {t('usage-unknown', 'Could not check which records hold a value.')}
      </p>
    );
  }

  return (
    <div className="flex flex-col">
      <p className="border-b px-3 py-2 text-xs text-muted-foreground">
        {!counts?.known
          ? t('usage-records-shown', 'Showing {{count}} records', {
              count: usage.samples.length,
            })
          : counts.count > usage.samples.length
            ? t('usage-records-first', 'First {{shown}} of {{total}} records', {
                shown: usage.samples.length,
                total: formatUsageTotal(counts),
              })
            : t('usage-records', '{{count}} records hold a value', {
                count: counts.count,
              })}
      </p>
      <div className="flex max-h-64 flex-col overflow-y-auto p-1">
        {usage.samples.map((record) =>
          toLink ? (
            <Button
              key={record._id}
              variant="ghost"
              size="sm"
              className="justify-between"
              asChild
            >
              <Link to={toLink(record._id)} target="_blank">
                <span className="truncate">{record.label}</span>
                <IconExternalLink className="text-muted-foreground" />
              </Link>
            </Button>
          ) : (
            <span key={record._id} className="truncate px-2 py-1 text-sm">
              {record.label}
            </span>
          ),
        )}
      </div>
    </div>
  );
};
