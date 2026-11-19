import { describe, expect, it } from 'vite-plus/test';
import { notificationRow } from '../../scripts/officenext/notifications';
import { filterOf, pathOf } from '../../scripts/officenext/segments';

/** An old segment as the importer reads it. */
const segment = (id: string, conditions: Record<string, unknown>[], conjunction = 'and') => ({
  id,
  name: id,
  contentType: 'core:customer',
  conditionsConjunction: conjunction,
  conditions: conditions.map((condition) => ({
    type: 'property',
    subSegmentId: null,
    propertyName: null,
    propertyOperator: null,
    propertyValue: undefined,
    ...condition,
  })),
  createdBy: null,
  createdAt: null,
  updatedAt: null,
});

describe('officenext import: segments', () => {
  it('maps built-in, custom and tracked properties to core filter paths', () => {
    expect(pathOf('customer', 'primaryEmail')).toBe('subject.primaryEmail');
    expect(pathOf('lead', 'lastSeenAt')).toBe('subject.lastActivityAt');
    expect(pathOf('customer', 'customFieldsData.f1')).toBe('subject.customFields.f1');
    expect(pathOf('company', 'trackedData.plan-name')).toBe(
      'subject.customFields.tracked_company_plan_name',
    );
    expect(pathOf('customer', 'visitorContactInfo')).toBe(null);
  });

  it('turns plain rules and sub-segments into a condition group', () => {
    const sub = segment('sub', [{ propertyName: 'code', propertyOperator: 'is' }]);

    const main = segment(
      'main',
      [
        { propertyName: 'firstName', propertyOperator: 'c', propertyValue: 'Bat' },
        { type: 'subSegment', subSegmentId: 'sub' },
      ],
      'or',
    );

    expect(filterOf(main, 'customer', new Map([['sub', sub]]))).toEqual({
      match: 'any',
      rules: [
        { path: 'subject.firstName', op: 'contains', value: 'Bat' },
        { match: 'all', rules: [{ path: 'subject.code', op: 'exists' }] },
      ],
    });
  });

  it("names why core can't run a segment", () => {
    const relative = segment('r', [{ propertyName: 'createdAt', propertyOperator: 'wobm' }]);
    const event = segment('e', [{ type: 'event' }]);
    const loop = segment('l', [{ type: 'subSegment', subSegmentId: 'l' }]);

    expect(filterOf(relative, 'customer', new Map())).toEqual({
      reason: 'operator wobm (relative dates) has no core match',
    });
    expect(filterOf(event, 'customer', new Map())).toEqual({
      reason: "event rules (events, dates) core can't run",
    });
    expect(filterOf(loop, 'customer', new Map([['l', loop]]))).toEqual({
      reason: 'a sub-segment is missing or loops',
    });
  });
});

/** An old notification as the importer reads it. */
const notification = (fields: Record<string, unknown>) => ({
  id: 'n1',
  userId: null,
  receiver: 'u1',
  fromUserId: null,
  createdUser: null,
  notifType: null,
  action: null,
  contentType: null,
  contentTypeId: null,
  title: null,
  message: null,
  content: null,
  priority: null,
  isRead: false,
  readAt: null,
  expiresAt: null,
  date: null,
  createdAt: new Date('2025-01-01T00:00:00Z'),
  updatedAt: null,
  ...fields,
});

describe('officenext import: notifications', () => {
  const members = new Set(['u1', 'u2']);
  const now = new Date('2026-01-01T00:00:00Z');

  it('puts a 3.x deal notice on the deal, from the member who sent it, unread', () => {
    const row = notificationRow(
      notification({
        notifType: 'dealAdd',
        contentType: 'deal',
        contentTypeId: 'd1',
        content: 'Big order',
        fromUserId: 'u2',
      }),
      members,
      now,
    );

    expect(row).toEqual([
      'n1',
      'u1',
      'sales',
      'dealAdd',
      'dealAdd',
      'Big order',
      'sales.deal',
      'd1',
      'normal',
      'user',
      'u2',
      'officenext:notification:n1',
      null,
      new Date('2025-01-01T00:00:00Z'),
      JSON.stringify({ importedFrom: 'erxes 3', oldContentType: 'deal' }),
    ]);
  });

  it('comes in read once expired, and is dropped for someone not a member', () => {
    const expired = notificationRow(
      notification({ title: 'Reminder', expiresAt: new Date('2025-06-01T00:00:00Z') }),
      members,
      now,
    );

    expect(expired?.[12]).toEqual(new Date('2025-01-01T00:00:00Z'));
    expect(expired?.slice(2, 4)).toEqual(['erxes3', 'notice']);
    expect(notificationRow(notification({ receiver: 'gone' }), members, now)).toBe(null);
  });
});
