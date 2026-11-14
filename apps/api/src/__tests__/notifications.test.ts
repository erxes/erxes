import { describe, expect, it } from 'vite-plus/test';
import { loggedEmails } from '~/modules/email/email';
import { settle } from './settle';

import { useTestDatabase } from './db';
import { useTwoOrgs } from './support';

/** Plugin notifications, each member's inboxes, their settings and core's own notices. */
describe('notifications', () => {
  useTestDatabase();

  const t = useTwoOrgs();

  it('lets plugins notify members, retry-safe, and skips inactive members', async () => {
    const leave = {
      userIds: [t.ids.member, t.ids.disabled],
      kind: 'hr.leave.requested',
      title: 'Leave request from Bat',
      link: '/hr/leaves/abc',
      entityType: 'leave',
      entityId: 'abc',
      dedupeKey: 'leave-abc',
    };

    expect(await t.hr().notifications.create(leave)).toEqual({ created: 1, skipped: 1 });
    expect(await t.hr().notifications.create(leave)).toEqual({ created: 0, skipped: 2 });
  });

  it('checks what plugins send', async () => {
    const note = { userIds: [t.ids.member], title: 'x', kind: 'hr.x' };

    await expect(
      t.hr().notifications.create({ ...note, kind: 'ecom.order.paid' }),
    ).rejects.toMatchObject({ code: 'INVALID_TYPE' });
    await expect(
      t.hr().notifications.create({ ...note, userIds: ['nobody'] }),
    ).rejects.toMatchObject({ code: 'INVALID_RECIPIENT' });
    await expect(
      t.hr().notifications.create({ ...note, link: 'https://evil.example' }),
    ).rejects.toMatchObject({ code: 'INVALID_INPUT' });
    // Members can't create notifications; plugins can't read inboxes.
    await expect(t.member().notifications.create(note)).rejects.toMatchObject({ status: 403 });
    await expect(t.hr().notifications.list({})).rejects.toMatchObject({ status: 403 });
    // No token for an organisation that hasn't installed the plugin.
    await expect(t.hr('missing').notifications.unreadCount({})).rejects.toMatchObject({
      code: 'NOT_INSTALLED',
    });
  });

  it('gives each member their own inbox with unread counts', async () => {
    await t.hr().notifications.create({
      userIds: [t.ids.member],
      kind: 'hr.review.due',
      title: 'Review due',
      priority: 'high',
    });

    expect((await t.member().notifications.unreadCount({})).count).toBe(2);
    expect((await t.owner().notifications.unreadCount({})).count).toBe(0);

    const inbox = await t.member().notifications.list({ unread: 'true' });

    expect(inbox.data.map((item) => item.kind)).toEqual(['hr.review.due', 'hr.leave.requested']);
    expect(inbox.data[1]).toMatchObject({
      source: 'hr',
      readAt: null,
      entityType: 'leave',
      entityId: 'abc',
    });

    const ids = inbox.data.slice(0, 1).map((item) => item.id);

    expect((await t.owner().notifications.markRead({ ids })).updated).toBe(0);
    expect((await t.member().notifications.markRead({ ids })).updated).toBe(1);
    expect((await t.member().notifications.unreadCount({})).count).toBe(1);
    expect((await t.member().notifications.markRead({})).updated).toBe(1);
    expect((await t.member().notifications.list({ unread: 'true' })).data).toHaveLength(0);

    const [first = ''] = ids;

    await expect(t.owner().notifications.remove({ id: first })).rejects.toMatchObject({
      status: 404,
    });
    await t.member().notifications.remove({ id: first });
  });

  it('tells a member when someone else makes them a customer’s owner', async () => {
    const created = await t.owner().customers.create({
      firstName: 'Owned',
      primaryEmail: 'owned@mail.mn',
      ownerId: t.ids.member,
    });

    const inbox = await t.member().notifications.list({ source: 'core' });

    expect(inbox.data[0]).toMatchObject({
      kind: 'core.customer.assigned',
      body: 'Owned',
      link: `/contacts/customers/${created.id}`,
      actorType: 'user',
      actorId: t.ids.owner,
    });

    // Making yourself owner doesn't notify you.
    await t.member().customers.create({
      firstName: 'Mine',
      primaryEmail: 'mine@mail.mn',
      ownerId: t.ids.member,
    });
    expect((await t.member().notifications.list({ source: 'core' })).totalCount).toBe(1);
  });

  it('counts unread per inbox and filters one plugin’s inbox', async () => {
    await t.member().notifications.markRead({});
    await t.hr().notifications.create({
      userIds: [t.ids.member],
      kind: 'hr.onboarding.started',
      title: 'Onboarding started',
      priority: 'high',
    });

    expect((await t.member().notifications.unreadCount({})).bySource.hr).toBe(1);
    expect(await t.member().notifications.unreadCount({ source: 'hr' })).toEqual({
      count: 1,
      bySource: { hr: 1 },
    });

    const important = await t.member().notifications.list({ source: 'hr', priority: 'high' });

    expect(important.data.map((item) => item.kind)).toEqual(['hr.onboarding.started']);
    expect((await t.member().notifications.list({ kind: 'hr.onboarding.' })).totalCount).toBe(1);
  });

  it('lets members choose per group (inbox and email, inbox, off), never for security', async () => {
    const saved = await t
      .member()
      .notifications.updateSettings({ groups: { hr: 'off', records: 'off' } });

    expect(saved.groups).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: 'hr', plugin: true, delivery: 'off' }),
        expect.objectContaining({ key: 'records', delivery: 'off' }),
        expect.objectContaining({ key: 'assigned', delivery: 'email' }),
        expect.objectContaining({ key: 'security', locked: true, delivery: 'inbox' }),
      ]),
    );
    expect(saved).toMatchObject({ email: true, browser: false });
    await expect(
      t.member().notifications.updateSettings({ groups: { security: 'off' } }),
    ).rejects.toMatchObject({ code: 'ALWAYS_ON' });

    expect(
      await t.hr().notifications.create({ userIds: [t.ids.member], kind: 'hr.x', title: 'muted' }),
    ).toEqual({ created: 0, skipped: 1 });

    await t.owner().users.update({ id: t.ids.member, role: 'admin' });
    await t.owner().users.update({ id: t.ids.member, role: 'member' });

    const roles = await t.member().notifications.list({ kind: 'core.user.role_changed' });

    expect(roles.totalCount).toBe(2);
    expect(roles.data[0]).toMatchObject({
      priority: 'high',
      data: { changes: { role: ['admin', 'member'] } },
    });

    // Assigned to me: in the inbox and by email (the default), unless email is off.
    const assign = async (firstName: string) => {
      await t.owner().customers.create({ firstName, ownerId: t.ids.member });
      await settle();

      return loggedEmails.some(
        (mail) =>
          mail.subject === 'A customer was assigned to you' && mail.text.includes(firstName),
      );
    };

    expect(await assign('Mailed')).toBe(true);
    await t.member().notifications.updateSettings({ email: false, browser: true });
    expect(await assign('NotMailed')).toBe(false);
    expect(await t.member().notifications.settings({})).toMatchObject({
      email: false,
      browser: true,
    });

    await t.member().notifications.updateSettings({
      groups: { hr: 'inbox', records: 'inbox' },
      email: true,
      browser: false,
    });
  });

  it('tells owners what others change, merging quick edits into one notification', async () => {
    const { id } = await t.member().customers.create({
      firstName: 'Watched',
      primaryEmail: 'watched@mail.mn',
      ownerId: t.ids.member,
    });

    await t.owner().customers.update({ id, position: 'Manager' });
    await t.owner().customers.update({ id, position: 'Director', code: 'C-1' });

    const updated = () => t.member().notifications.list({ kind: 'core.customer.updated' });
    const updates = await updated();

    expect(updates.totalCount).toBe(1);
    expect(updates.data[0]?.data).toEqual({
      changes: { position: [null, 'Director'], code: [null, 'C-1'] },
    });

    // The owner's own edits don't notify them.
    await t.member().customers.update({ id, department: 'Sales' });
    expect((await updated()).totalCount).toBe(1);

    // A plugin event on the record reaches the owner's inbox for that plugin.
    await t.hr().activities.create({
      targetType: 'customer',
      targetId: id,
      type: 'hr.candidate.hired',
      summary: 'Hired as Director',
    });

    const fromHr = await t
      .member()
      .notifications.list({ source: 'hr', kind: 'hr.candidate.hired' });

    expect(fromHr.data[0]).toMatchObject({
      title: 'Hired as Director',
      link: `/contacts/customers/${id}`,
    });

    await t.owner().customers.remove({ ids: [id] });

    const deleted = await t.member().notifications.list({ kind: 'core.customer.deleted' });

    expect(deleted.data[0]).toMatchObject({ body: 'Watched', link: null });
  });
});
