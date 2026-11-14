import type { AuditEntry, User } from '@erxes/core-contract';
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react';
import { Badge, Button, cn, RelativeDateDisplay, Spinner } from 'erxes-ui';
import { Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UserAvatar } from '~/components/UserAvatar';
import { actorLabel, pluginLabel, useMembersById } from '~/lib/members';
import { auditSentence } from './auditSentence';

const isWarning = (action: string) =>
  /deleted|merged|failed|disabled|role_changed|exported|password/.test(action);

/** A recorded value (any JSON) in one short line. */
const formatValue = (value: unknown) => {
  if (value === null || value === undefined || value === '') return '—';

  if (typeof value === 'string') return value.length > 80 ? `${value.slice(0, 80)}…` : value;

  return JSON.stringify(value);
};

const EntryDetails = ({ entry }: { entry: AuditEntry }) => (
  <div className="space-y-2 bg-muted/40 px-12 py-3 text-xs">
    {entry.changes && (
      <table className="w-full max-w-2xl">
        <tbody>
          {Object.entries(entry.changes).map(([field, [before, after]]) => (
            <tr key={field} className="align-top">
              <td className="w-40 py-0.5 pr-3 font-medium">{field}</td>
              <td className="py-0.5 pr-3 text-muted-foreground line-through">
                {formatValue(before)}
              </td>
              <td className="py-0.5">{formatValue(after)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
    {entry.metadata && (
      <pre className="max-w-2xl overflow-x-auto rounded bg-background p-2 text-2xs">
        {JSON.stringify(entry.metadata, null, 2)}
      </pre>
    )}
    <p className="text-muted-foreground">
      <span className="font-mono">{entry.action}</span>
      {[entry.ip && ` · IP ${entry.ip}`, entry.userAgent && ` · ${entry.userAgent}`]
        .filter(Boolean)
        .join('')}
      {entry.targetId && ` · ${entry.targetType} ${entry.targetId}`}
    </p>
  </div>
);

const EntryRow = ({
  entry,
  members,
  expanded,
  onToggle,
}: {
  entry: AuditEntry;
  members: Map<string, User>;
  expanded: boolean;
  onToggle: () => void;
}) => {
  const { t, i18n } = useTranslation('settings', { keyPrefix: 'audit-log' });

  const who = actorLabel(
    entry.actorType,
    entry.actorId,
    members,
    t('deleted-member', 'A removed member'),
  );

  const member =
    entry.actorType === 'user' && entry.actorId ? members.get(entry.actorId) : undefined;

  const warning = isWarning(entry.action);

  return (
    <tr className="border-b last:border-0 hover:bg-accent/50">
      <td className="pl-3 text-muted-foreground">
        <button
          type="button"
          aria-expanded={expanded}
          aria-label={t('details', 'Details')}
          onClick={onToggle}
          className="flex"
        >
          {expanded ? (
            <IconChevronDown className="size-4" />
          ) : (
            <IconChevronRight className="size-4" />
          )}
        </button>
      </td>
      <td
        className="px-3 py-2 whitespace-nowrap text-muted-foreground"
        aria-label={new Date(entry.createdAt).toLocaleString()}
      >
        <RelativeDateDisplay value={entry.createdAt} render={<span />}>
          <RelativeDateDisplay.Value value={entry.createdAt} />
        </RelativeDateDisplay>
      </td>
      <td className="px-3 py-2">
        <span className="flex items-center gap-2">
          <UserAvatar name={who} src={member?.avatarUrl} className="size-5" />
          <span className="truncate">{who}</span>
        </span>
      </td>
      <td className="px-3 py-2">
        <span className="flex flex-wrap items-center gap-1.5">
          {warning && <span className="size-1.5 rounded-full bg-destructive" aria-hidden="true" />}
          <button
            type="button"
            onClick={onToggle}
            className={cn('text-left', warning && 'font-medium')}
          >
            {auditSentence(entry, i18n.language)}
          </button>
          {entry.source !== 'core' && (
            <Badge variant="secondary" size="sm">
              {pluginLabel(entry.source)}
            </Badge>
          )}
        </span>
      </td>
      <td className="px-3 py-2 font-mono text-xs whitespace-nowrap text-muted-foreground">
        {entry.ip ?? '—'}
      </td>
    </tr>
  );
};

interface Paging {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
}

/** The entries, newest first; a row opens to show what changed. */
export const AuditTable = ({ entries, paging }: { entries: AuditEntry[]; paging: Paging }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'audit-log' });
  const [open, setOpen] = useState<string | null>(null);

  const members = useMembersById(
    entries.map((entry) => (entry.actorType === 'user' ? entry.actorId : null)),
  );

  return (
    <div className="m-3 overflow-hidden rounded-lg border bg-background">
      <table className="w-full text-sm">
        <thead className="border-b bg-muted/50 text-left text-xs text-muted-foreground">
          <tr>
            <th className="w-8">
              <span className="sr-only">{t('details', 'Details')}</span>
            </th>
            <th className="px-3 py-2 font-medium">{t('when', 'When')}</th>
            <th className="px-3 py-2 font-medium">{t('who', 'Who')}</th>
            <th className="px-3 py-2 font-medium">{t('what', 'What')}</th>
            <th className="px-3 py-2 font-medium">IP</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <Fragment key={entry.id}>
              <EntryRow
                entry={entry}
                members={members}
                expanded={open === entry.id}
                onToggle={() => setOpen(open === entry.id ? null : entry.id)}
              />
              {open === entry.id && (
                <tr className="border-b">
                  <td colSpan={5} className="p-0">
                    <EntryDetails entry={entry} />
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
      {paging.hasNextPage && (
        <div className="flex justify-center border-t py-2">
          <Button
            variant="ghost"
            size="sm"
            disabled={paging.isFetchingNextPage}
            onClick={paging.fetchNextPage}
          >
            {paging.isFetchingNextPage ? <Spinner size="sm" /> : t('load-more', 'Load more')}
          </Button>
        </div>
      )}
    </div>
  );
};
