import { beforeAll, describe, expect, it } from 'vite-plus/test';
import { useTestDatabase } from './db';
import { pluginApi } from './pluginApi';
import { useTwoOrgs } from './support';

describe(
  'timelines: plugin records, search, logged calls, reactions, plugin edits',
  { timeout: 300_000 },
  () => {
    useTestDatabase();

    const t = useTwoOrgs();

    beforeAll(async () => {
      await t.client(await t.pluginToken()).plugins.registerManifest({
        title: 'HR',
        version: '1',
        scopes: ['activities:write'],
        permissions: [{ action: 'hr.employee.view', label: 'See employees' }],
        timelines: [{ type: 'hr.employee', label: 'Employee', permission: 'hr.employee.view' }],
        activityTypes: [
          {
            type: 'hr.leave.approved',
            label: 'Leave approved',
            icon: 'IconBeach',
            color: '#16a34a',
          },
        ],
      });
    });

    it("keeps timelines for a plugin's own records, with its permission and namespace", async () => {
      const employee = { targetType: 'hr.employee', targetId: 'emp-1' };

      await expect(t.member().activities.list(employee)).rejects.toMatchObject({
        code: 'NOT_ALLOWED',
      });
      expect((await t.owner().activities.list(employee)).data).toEqual([]);
      await expect(
        t.owner().activities.list({ targetType: 'ecom.order', targetId: 'o1' }),
      ).rejects.toMatchObject({ code: 'NO_TIMELINE' });

      const note = await t.owner().activities.addNote({ ...employee, body: 'Great onboarding' });

      await t.hr().activities.create({
        ...employee,
        type: 'hr.leave.approved',
        summary: 'Leave approved: 3 days',
        dedupeKey: 'leave-1',
      });
      // Not another plugin's record type.
      await expect(
        t.hr().activities.create({
          targetType: 'ecom.order',
          targetId: 'o1',
          type: 'hr.x.y',
          summary: 'x',
        }),
      ).rejects.toMatchObject({ status: 403 });

      // The plugin changes its own entry (by dedupe key), then removes it.
      expect(
        (await t.hr().activities.update({ id: 'key:leave-1', summary: 'Leave approved: 2 days' }))
          .summary,
      ).toBe('Leave approved: 2 days');
      expect(
        (await t.owner().activities.list(employee)).data.map((item) => item.summary),
      ).toContain('Leave approved: 2 days');
      await expect(t.hr().activities.remove({ id: note.id })).rejects.toMatchObject({
        status: 404,
      });
      await t.hr().activities.remove({ id: 'key:leave-1' });

      const types = await t.member().activities.types({});

      expect(types.types).toContainEqual({
        type: 'hr.leave.approved',
        label: 'Leave approved',
        source: 'hr',
        icon: 'IconBeach',
        color: '#16a34a',
      });
      expect(types.timelines).toContainEqual({
        type: 'hr.employee',
        label: 'Employee',
        source: 'hr',
        permission: 'hr.employee.view',
      });
    });

    it('searches and filters, keeps note history, and counts reactions', async () => {
      const customer = await t.owner().customers.create({ firstName: 'Timeline' });
      const target = { targetType: 'customer', targetId: customer.id };
      const note = await t.owner().activities.addNote({ ...target, body: 'Wants the blue plan' });

      await t.member().activities.addNote({ ...target, body: 'Sent the brochure' });

      const list = async (query: {
        q?: string;
        kind?: 'notes' | 'all';
        actorId?: string;
        from?: string;
      }) => (await t.owner().activities.list({ ...target, ...query })).data;

      const theNote = async () =>
        (await list({ kind: 'notes' })).find((item) => item.id === note.id);

      expect((await list({ q: 'blue' })).map((item) => item.id)).toEqual([note.id]);

      // Entries carry who did them (name, else email) and, for links, the other side's name.
      expect(
        (await list({ kind: 'notes' }))
          .map((item) => item.actorName ?? '')
          .toSorted((a, b) => a.localeCompare(b)),
      ).toEqual(['member@acme.mn', 'owner@acme.mn']);

      const company = await t.owner().companies.create({ primaryName: 'Timeline Co' });

      await t.owner().customers.linkCompany({ id: customer.id, companyId: company.id });
      expect(
        (await list({ kind: 'all' })).find((item) => item.type === 'customer.company_linked')?.data,
      ).toEqual({ companyId: company.id, companyName: 'Timeline Co' });
      expect(await list({ actorId: t.ids.owner, kind: 'notes' })).toHaveLength(1);
      expect(await list({ from: new Date(Date.now() + 60_000).toISOString() })).toEqual([]);

      // Edits keep the earlier wording.
      await t.owner().activities.editNote({ id: note.id, body: 'Wants the green plan' });
      expect((await theNote())?.note?.body).toBe('Wants the green plan');
      expect((await t.owner().activities.noteVersions({ id: note.id })).data).toMatchObject([
        { body: 'Wants the blue plan' },
      ]);

      // Reactions: added, counted per member, taken back.
      const react = { id: note.id, emoji: '👍' };

      await Promise.all([t.owner().activities.react(react), t.member().activities.react(react)]);
      expect((await theNote())?.reactions['👍']).toHaveLength(2);
      await t.owner().activities.react(react);
      expect((await theNote())?.reactions['👍']).toHaveLength(1);
    });

    it('imports old notes once, as their author wrote them then', async () => {
      const note = {
        targetType: 'hr.employee',
        targetId: 'emp-3',
        body: 'Joined from the Darkhan branch',
        authorId: t.ids.member,
        createdAt: '2020-01-02T03:04:05.000Z',
        dedupeKey: 'note-old-1',
      };

      const first = await t.hr().activities.importNote(note);
      const retry = await t.hr().activities.importNote({ ...note, body: 'Changed on retry' });

      expect(first.created).toBe(true);
      expect(retry).toMatchObject({ created: false, activity: { id: first.activity.id } });
      expect(
        (await t.owner().activities.list({ ...note, kind: 'notes' })).data.map((entry) => ({
          actorId: entry.actorId,
          occurredAt: entry.occurredAt,
          body: entry.note?.body,
        })),
      ).toEqual([
        {
          actorId: t.ids.member,
          occurredAt: note.createdAt,
          body: 'Joined from the Darkhan branch',
        },
      ]);
      await expect(
        t.hr().activities.importNote({ ...note, targetType: 'ecom.order', dedupeKey: 'x' }),
      ).rejects.toMatchObject({ code: 'NOT_ALLOWED' });
      await expect(t.owner().activities.importNote(note)).rejects.toMatchObject({ status: 403 });
    });

    it('asks the plugin whether a member may read a record with recordAccess', async () => {
      const api = await pluginApi(t.url(''));

      try {
        await t.client(await t.pluginToken()).plugins.registerManifest({
          title: 'HR',
          version: '2',
          scopes: ['activities:write'],
          api: { url: api.url },
          timelines: [{ type: 'hr.employee', label: 'Employee', recordAccess: true }],
        });
        api.readable.add('emp-1');

        expect(
          (await t.owner().activities.list({ targetType: 'hr.employee', targetId: 'emp-1' })).data,
        ).not.toEqual([]);
        expect(api.accessChecks).toContainEqual({
          orgId: t.ids.org,
          userId: t.ids.owner,
          type: 'hr.employee',
          id: 'emp-1',
        });

        const emp2 = { targetType: 'hr.employee', targetId: 'emp-2' };

        await expect(t.owner().activities.list(emp2)).rejects.toMatchObject({
          code: 'NOT_ALLOWED',
        });
        await expect(t.member().activities.addNote({ ...emp2, body: 'x' })).rejects.toMatchObject({
          code: 'NOT_ALLOWED',
        });
        // The plugin writes to its records without asking itself.
        await t.hr().activities.create({ ...emp2, type: 'hr.leave.approved', summary: 'x' });
      } finally {
        await api.close();
      }

      // A plugin that doesn't answer is a no.
      await expect(
        t.owner().activities.list({ targetType: 'hr.employee', targetId: 'emp-1' }),
      ).rejects.toMatchObject({ code: 'NOT_ALLOWED' });
    });
  },
);
