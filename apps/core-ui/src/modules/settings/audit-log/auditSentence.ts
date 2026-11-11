import type { AuditEntry } from '@erxes/core-contract';

type Changes = Record<string, [unknown, unknown]>;

const ROLE: Record<string, string> = { owner: 'Owner', admin: 'Admin', member: 'Member' };

const value = (input: unknown) => {
  if (input === null || input === undefined || input === '') return 'empty';
  if (typeof input === 'string') return ROLE[input] ?? input;
  if (Array.isArray(input)) return input.length ? input.join(', ') : 'none';

  return JSON.stringify(input);
};

/** Field names as people say them: `primaryEmail` → "primary email", `customFields.x` → "a property". */
const fieldName = (field: string) =>
  field.startsWith('customFields.')
    ? 'a property'
    : field === 'tagIds'
      ? 'tags'
      : field.replace(/([A-Z])/g, ' $1').toLowerCase();

const fields = (changes: Changes | null) => {
  const names = Object.keys(changes ?? {}).map(fieldName);

  return names.length > 3 ? `${names.slice(0, 3).join(', ')} and ${names.length - 3} more` : names.join(', ');
};

const humanize = (text: string) => text.replace(/[_.]/g, ' ');

/**
 * One readable sentence for an entry ("changed Bold's role from Member to
 * Admin"); the actor's name is shown next to it. Plugin actions read from
 * their names (`hr.employee.deleted` → "employee deleted").
 */
export const auditSentence = (entry: AuditEntry): string => {
  const label = entry.targetLabel ?? entry.targetId ?? '';
  const changes = entry.changes as Changes | null;
  const metadata = (entry.metadata ?? {}) as Record<string, unknown>;
  const [record = '', verb = ''] = entry.action.split('.');

  switch (entry.action) {
    case 'auth.signed_in':
      return 'signed in';
    case 'auth.signed_out':
      return 'signed out';
    case 'auth.sign_in_failed':
      return `failed to sign in as ${label}${metadata.reason ? ` (${metadata.reason})` : ''}`;
    case 'auth.password_changed':
      return 'changed their password';
    case 'organization.created':
      return `created the organisation ${label}`;
    case 'user.invited':
      return `invited ${label} as ${value(metadata.role)}`;
    case 'user.role_changed':
      return changes?.role ? `changed ${label}'s role from ${value(changes.role[0])} to ${value(changes.role[1])}` : `changed ${label}'s role`;
    case 'user.updated':
      return `updated ${label}'s ${fields(changes) || 'profile'}`;
    case 'user.password_set':
      return `set a new password for ${label}`;
    case 'user.disabled':
      return `deactivated ${label}`;
    case 'user.enabled':
      return `reactivated ${label}`;
    case 'settings.files_changed':
      return 'changed the file upload settings';
    case 'settings.audit_retention_changed':
      return changes?.retentionDays
        ? `changed audit retention from ${value(changes.retentionDays[0])} to ${value(changes.retentionDays[1])} days`
        : 'changed audit retention';
    case 'audit.exported':
      return `exported the audit log (${value(metadata.rows)} entries, ${String(metadata.format ?? 'csv').toUpperCase()})`;
    case 'file.uploaded':
      return `uploaded ${label}`;
    case 'file.downloaded':
      return `downloaded ${label}`;
    case 'file.deleted':
      return `deleted the file ${label}`;
  }

  if (entry.source === 'core' && ['customer', 'company', 'tag', 'field', 'field_group'].includes(record)) {
    const noun = record === 'field' ? 'property' : record === 'field_group' ? 'property group' : record;

    if (verb === 'updated' && changes) return `updated ${noun} ${label}: ${fields(changes)}`;
    if (verb === 'merged') {
      const names = (metadata.mergedNames as string[] | undefined) ?? [];

      return `merged ${names.join(', ') || 'records'} into ${noun} ${label}`;
    }

    return `${humanize(verb)} ${noun} ${label}`.trim();
  }

  const action = entry.action.startsWith(`${entry.source}.`) ? entry.action.slice(entry.source.length + 1) : entry.action;

  return `${humanize(action)}${label ? ` · ${label}` : ''}${changes ? `: ${fields(changes)}` : ''}`;
};
