/**
 * OUTCOME/SPEC-based tests for revert-capture selectivity.
 *
 * Expected values come from the FEATURE REQUIREMENT, not from reading the
 * implementation:
 *  - the journal must never capture the log/audit family (it would journal
 *    itself) nor ephemeral session/queue/metric churn;
 *  - a business collection must stay revertable even when its name merely
 *    contains a denied substring (otherwise users silently lose undo);
 *  - a schema may explicitly opt out.
 */
import {
  isRevertCaptureDenied,
  isSchemaRevertOptedOut,
} from '../revertSelectivity';

describe('revertSelectivity: which collections may be auto-journaled', () => {
  // MUST be denied — capturing these is wrong (recursion / pure churn).
  test.each([
    'logs',
    'log',
    'erxes_logs',
    'event_logs',
    'audit_log',
    'audit_logs',
    'sessions',
    'user_sessions',
    'metrics',
    'jobs',
    'locks',
    'heartbeats',
  ])('must DENY the non-revertable collection "%s"', (name) => {
    expect(isRevertCaptureDenied(name)).toBe(true);
  });

  // MUST NOT be denied — real business data, even if the name embeds "log".
  test.each([
    'customers',
    'companies',
    'deals',
    'tags',
    'blogs',
    'catalogs',
    'dialogs',
    'changelogs',
    'prevent_logger',
    'my_event_logger',
  ])('must NOT deny the business collection "%s"', (name) => {
    expect(isRevertCaptureDenied(name)).toBe(false);
  });

  test('missing / empty collection name is not denied', () => {
    expect(isRevertCaptureDenied('')).toBe(false);
    expect(isRevertCaptureDenied(undefined)).toBe(false);
  });

  test('a schema can explicitly opt out of capture', () => {
    expect(isSchemaRevertOptedOut({ revertCapture: false })).toBe(true);
    expect(isSchemaRevertOptedOut({ skipRevertCapture: true })).toBe(true);
    expect(isSchemaRevertOptedOut({})).toBe(false);
    expect(isSchemaRevertOptedOut(undefined)).toBe(false);
  });
});
