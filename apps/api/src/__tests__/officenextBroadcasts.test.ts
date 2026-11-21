import { describe, expect, it } from 'vite-plus/test';
import { fromEvents } from '../../scripts/officenext/broadcastRecipients';
import { broadcastOf } from '../../scripts/officenext/broadcasts';
import { favoriteOf } from '../../scripts/officenext/favorites';
import { suppressionOf } from '../../scripts/officenext/suppressions';

const ran = new Date('2026-09-28T07:17:03Z');

/** An old campaign as the importer reads it. */
const campaign = (fields: Record<string, unknown>) => ({
  id: 'b1',
  title: 'Autumn offer',
  method: 'email',
  kind: 'manual',
  isDraft: false,
  lastRunAt: null,
  runCount: null,
  segmentIds: [],
  totalCustomersCount: 480,
  validCustomersCount: 471,
  email: {
    subject: 'New branch',
    sender: 'erxes academy',
    replyTo: null,
    content: '<p>Hello&nbsp;there</p>',
  },
  createdBy: 'u1',
  fromUserId: null,
  createdAt: new Date('2026-09-01T00:00:00Z'),
  updatedAt: null,
  ...fields,
});

describe('officenext import: broadcasts', () => {
  const context = { members: new Set(['u1']), views: new Set(['s1']), mailed: new Set(['b2']) };

  it('brings a campaign that ran in as sent, with its body as text and its view', () => {
    const placed = broadcastOf(campaign({ lastRunAt: ran, segmentIds: ['s1'] }), context);

    expect(placed.row).toEqual([
      'b1',
      'Autumn offer',
      'email',
      'sent',
      's1',
      'New branch',
      'Hello there',
      'erxes academy',
      null,
      ran,
      ran,
      471,
      'u1',
      new Date('2026-09-01T00:00:00Z'),
      new Date('2026-09-01T00:00:00Z'),
    ]);
  });

  it('brings a campaign that never ran in cancelled, and leaves other channels out', () => {
    const placed = broadcastOf(campaign({ isDraft: true, segmentIds: ['gone'] }), context);

    expect(placed.row?.slice(3, 5)).toEqual(['cancelled', null]);
    expect(broadcastOf(campaign({ id: 'b2' }), context).row?.[3]).toBe('sent');
    expect(broadcastOf(campaign({ method: 'messenger' }), context)).toEqual({
      skip: 'plugin:frontline (messenger campaign)',
    });
  });

  it('adds up a customer’s mail events', () => {
    expect(fromEvents(['send', 'delivery', 'open', 'click'])).toEqual({
      status: 'sent',
      reason: null,
      opened: true,
      clicked: true,
    });
    expect(fromEvents(['send', 'bounce'])).toEqual({ status: 'failed', reason: 'bounced' });
    expect(fromEvents(['send', 'delivery', 'complaint'])).toMatchObject({
      status: 'sent',
      reason: 'complained',
      opened: false,
    });
  });
});

/** An old favorite as the importer reads it. */
const favorite = (fields: Record<string, unknown>) => ({
  id: 'f1',
  path: '/contacts/customers',
  label: null,
  userId: 'u1',
  breadcrumb: [],
  createdAt: null,
  ...fields,
});

describe('officenext import: favorites and suppressions', () => {
  const members = new Set(['u1']);

  it('keeps stars on core pages and names the old app of the rest', () => {
    expect(favoriteOf(favorite({ breadcrumb: ['Contacts', 'Customers'] }), members)).toEqual({
      user: 'u1',
      path: '/contacts/customers',
      label: 'Contacts / Customers',
    });
    expect(favoriteOf(favorite({ path: '/sales/deals?boardId=b1' }), members)).toEqual({
      skip: 'old sales page: the new app has other addresses',
    });
    expect(favoriteOf(favorite({ userId: 'gone' }), members)).toEqual({
      skip: 'member not in core',
    });
  });

  it('suppresses screened addresses and leaves plain send counts out', () => {
    const at = new Date('2026-08-04T03:42:38Z');

    const address = (fields: Record<string, unknown>) => ({
      id: 'e1',
      email: ' Bat@Example.MN ',
      suppressedAt: at,
      suppressionReason: 'screened',
      screenReason: 'no_mx',
      releasedAt: null,
      createdAt: at,
      ...fields,
    });

    expect(suppressionOf(address({}))).toEqual({
      row: ['e1', 'email', 'bat@example.mn', 'manual', 'old erxes screening: no_mx', at],
    });
    expect(suppressionOf(address({ suppressedAt: null }))).toEqual({
      skip: 'never suppressed (send counts only)',
    });
    expect(suppressionOf(address({ releasedAt: at }))).toEqual({
      skip: 'released again in old erxes',
    });
  });
});
