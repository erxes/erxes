import type { AuditEntry } from '@erxes/core-contract';
import { describe, expect, it } from 'vite-plus/test';
import { auditSentence } from '../auditSentence';

const entry = (row: Partial<AuditEntry>): AuditEntry => ({
  id: 'entry1',
  actorType: 'user',
  actorId: 'user1',
  action: 'auth.signed_in',
  targetType: null,
  targetId: null,
  targetLabel: null,
  changes: null,
  metadata: null,
  ip: null,
  userAgent: null,
  source: 'core',
  createdAt: '2026-11-22T00:00:00.000Z',
  ...row,
});

describe('the default payment gateway in the audit log', () => {
  it('names the gateway made the default', () => {
    expect(
      auditSentence(
        entry({
          action: 'payment.default_gateway_changed',
          targetId: 'org1',
          targetLabel: 'QPay',
          changes: { defaultGatewayId: [null, 'gw1'] },
        }),
        'en',
      ),
    ).toBe('made QPay the default payment gateway');
  });

  it('says the default was cleared, not the organisation it belongs to', () => {
    expect(
      auditSentence(
        entry({
          action: 'payment.default_gateway_changed',
          targetId: 'org1',
          changes: { defaultGatewayId: ['gw1', null] },
        }),
        'en',
      ),
    ).toBe('cleared the default payment gateway');
  });
});

describe('an audit entry as a sentence', () => {
  it.each<[string, Partial<AuditEntry>, string]>([
    ['settings.files_changed', {}, 'changed the file upload settings'],
    [
      'settings.files_bucket_set',
      { targetLabel: 'media' },
      'set new uploads to go to the bucket media',
    ],
    [
      'settings.files_bucket_removed',
      { targetLabel: 'media' },
      'set new uploads to go to the server again, instead of the bucket media',
    ],
    [
      'settings.audit_retention_changed',
      { changes: { retentionDays: [90, 365] } },
      'changed audit retention from 90 to 365 days',
    ],
    [
      'settings.audit_retention_changed',
      { changes: { retentionDays: [null, 30] } },
      'changed audit retention from empty to 30 days',
    ],
    ['settings.audit_retention_changed', {}, 'changed audit retention'],
    ['auth.signed_in', {}, 'signed in'],
    ['auth.signed_out', {}, 'signed out'],
    [
      'audit.stream_created',
      { targetLabel: 'Splunk', metadata: { url: 'https://logs.test/hook' } },
      'started streaming the audit log to Splunk (https://logs.test/hook)',
    ],
    ['audit.stream_updated', { targetLabel: 'Splunk' }, 'changed audit log streaming to Splunk'],
    ['audit.stream_paused', { targetLabel: 'Splunk' }, 'paused audit log streaming to Splunk'],
    ['audit.stream_resumed', { targetLabel: 'Splunk' }, 'resumed audit log streaming to Splunk'],
    [
      'audit.stream_removed',
      { targetLabel: 'Splunk' },
      'stopped streaming the audit log to Splunk',
    ],
    [
      'payment.refunded',
      {
        targetLabel: 'INV-1',
        metadata: { amount: 1250, currency: 'USD', method: 'manual', reason: 'Damaged' },
      },
      'refunded $12.50 of INV-1 (paid back outside erxes): Damaged',
    ],
    [
      'payment.refunded',
      { targetLabel: 'INV-2', metadata: { amount: 5000, method: 'card', reason: 'Late' } },
      'refunded MNT 50.00 of INV-2: Late',
    ],
    [
      'payment.refunded',
      { targetLabel: 'INV-3', metadata: { reason: 'Unknown' } },
      'refunded  of INV-3: Unknown',
    ],
    [
      'auth.sign_in_failed',
      { targetLabel: 'bold@acme.mn', metadata: { reason: 'wrong password' } },
      'failed to sign in as bold@acme.mn (wrong password)',
    ],
    ['auth.sign_in_failed', { targetLabel: 'bold@acme.mn' }, 'failed to sign in as bold@acme.mn'],
    ['auth.password_changed', {}, 'changed their password'],
    ['auth.password_set', {}, 'set their password'],
    ['organization.created', { targetLabel: 'Acme' }, 'created the organisation Acme'],
    [
      'organization.updated',
      { changes: { name: ['Acme', 'Acme LLC'], primaryEmail: [null, 'hi@acme.mn'] } },
      "changed the organisation's name, primary email",
    ],
    ['organization.updated', {}, "changed the organisation's details"],
    [
      'user.invited',
      { targetLabel: 'bold@acme.mn', metadata: { role: 'admin' } },
      'invited bold@acme.mn as Admin',
    ],
    [
      'user.invited',
      { targetLabel: 'bold@acme.mn', metadata: { role: 'sales' } },
      'invited bold@acme.mn as sales',
    ],
    ['user.invited', { targetLabel: 'bold@acme.mn' }, 'invited bold@acme.mn as empty'],
    [
      'user.role_changed',
      { targetLabel: 'Bold', changes: { role: ['member', 'owner'] } },
      "changed Bold's role from Member to Owner",
    ],
    [
      'user.role_changed',
      { targetLabel: 'Bold', changes: { role: ['', 'admin'] } },
      "changed Bold's role from empty to Admin",
    ],
    ['user.role_changed', { targetLabel: 'Bold' }, "changed Bold's role"],
    [
      'user.updated',
      {
        targetLabel: 'Bold',
        changes: {
          firstName: ['B', 'Bold'],
          lastName: [null, 'Bat'],
          'customFields.size': [null, 'L'],
          tagIds: [[], ['t1']],
        },
      },
      "updated Bold's first name, last name, a property and 1 more",
    ],
    [
      'user.updated',
      {
        targetLabel: 'Bold',
        changes: { tagIds: [[], ['t1']], 'customFields.size': [null, 'L'], position: ['', 'CEO'] },
      },
      "updated Bold's tags, a property, position",
    ],
    ['user.updated', { targetLabel: 'Bold' }, "updated Bold's profile"],
    ['user.password_set', { targetLabel: 'Bold' }, 'set a new password for Bold'],
    ['user.disabled', { targetLabel: 'Bold' }, 'deactivated Bold'],
    ['user.enabled', { targetLabel: 'Bold' }, 'reactivated Bold'],
    [
      'audit.exported',
      { metadata: { rows: 12, format: 'json' } },
      'exported the audit log (12 entries, JSON)',
    ],
    ['audit.exported', { metadata: { rows: 0 } }, 'exported the audit log (0 entries, CSV)'],
    ['file.uploaded', { targetLabel: 'contract.pdf' }, 'uploaded contract.pdf'],
    ['file.downloaded', { targetLabel: 'contract.pdf' }, 'downloaded contract.pdf'],
    ['file.deleted', { targetId: 'file1' }, 'deleted the file file1'],
    [
      'customer.updated',
      { targetLabel: 'Nora', changes: { firstName: ['Nor', 'Nora'] } },
      'updated customer Nora: first name',
    ],
    ['customer.updated', { targetLabel: 'Nora' }, 'updated customer Nora'],
    [
      'customer.created',
      { targetLabel: 'Nora', changes: { firstName: [null, 'Nora'] } },
      'created customer Nora',
    ],
    [
      'company.merged',
      { targetLabel: 'Acme', metadata: { mergedNames: ['A Co', 'B Co'] } },
      'merged A Co, B Co into company Acme',
    ],
    ['company.merged', { targetLabel: 'Acme' }, 'merged records into company Acme'],
    ['customer.opted_out', { targetLabel: 'Nora' }, 'opted out customer Nora'],
    ['tag.created', {}, 'created tag'],
    ['field.created', { targetLabel: 'Size' }, 'created property Size'],
    ['field_group.deleted', { targetLabel: 'Basics' }, 'deleted property group Basics'],
    ['webhook.created', { targetLabel: 'Orders' }, 'webhook created · Orders'],
    ['broadcast', {}, 'broadcast'],
  ])('reads %s as a sentence', (action, row, sentence) => {
    expect(auditSentence(entry({ action, ...row }), 'en')).toBe(sentence);
  });

  it.each<[string, Partial<AuditEntry>, string]>([
    ['hr.employee.deleted', { targetLabel: 'Bold' }, 'employee deleted · Bold'],
    [
      'hr.employee.updated',
      { targetLabel: 'Bold', changes: { salaryAmount: [1, 2] } },
      'employee updated · Bold: salary amount',
    ],
    ['hr.sync_ran', {}, 'sync ran'],
    ['payroll.closed', {}, 'payroll closed'],
  ])('reads a plugin’s %s from its name', (action, row, sentence) => {
    expect(auditSentence(entry({ action, source: 'hr', ...row }), 'en')).toBe(sentence);
  });

  it('reads a plugin named like a core record as the plugin’s', () => {
    expect(
      auditSentence(
        entry({ action: 'field.visit_scheduled', source: 'field', targetLabel: 'Site A' }),
        'en',
      ),
    ).toBe('visit scheduled · Site A');
  });
});
