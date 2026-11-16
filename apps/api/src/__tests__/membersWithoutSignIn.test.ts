import { describe, expect, it } from 'vite-plus/test';
import { workspaceUsage } from '~/modules/saas/workspace';
import { useTestDatabase } from './db';
import { useTwoOrgs } from './support';

describe('team members who do not sign in', { timeout: 120_000 }, () => {
  useTestDatabase();

  const t = useTwoOrgs();

  it('keeps people on the team without an account or a seat', async () => {
    const seats = (await workspaceUsage(t.ids.org)).usage.teamMembers;
    const owner = t.owner();

    const bold = await owner.users.add({ fullName: 'Bold Bat', employeeId: 'W-1' });

    expect(bold).toMatchObject({
      fullName: 'Bold Bat',
      firstName: 'Bold',
      email: null,
      canSignIn: false,
      status: 'active',
      role: 'member',
    });
    expect((await workspaceUsage(t.ids.org)).usage.teamMembers).toBe(seats);

    // They are team members everywhere else: a unit takes them, the list filters them.
    const depot = await owner.units.create({ kind: 'branch', name: 'Depot', memberIds: [bold.id] });

    expect(depot.memberIds).toEqual([bold.id]);
    expect((await owner.users.list({ canSignIn: false })).data.map((user) => user.id)).toEqual([
      bold.id,
    ]);

    // An email doesn't let them in: no password, and sign-in and resets skip them.
    const saraa = await owner.users.add({ fullName: 'Saraa', email: 'Saraa@acme.mn' });

    expect(saraa.email).toBe('saraa@acme.mn');
    await expect(
      t.browser().api.auth.signIn({ email: 'saraa@acme.mn', password: 'anything at all' }),
    ).rejects.toMatchObject({ code: 'INVALID_CREDENTIALS' });
    await expect(
      owner.users.setPassword({ id: saraa.id, password: 'Strong-pass-123' }),
    ).rejects.toMatchObject({ status: 403 });
    await expect(
      owner.users.add({ fullName: 'Again', email: 'saraa@acme.mn' }),
    ).rejects.toMatchObject({ code: 'TAKEN' });
  });

  it('invites them to sign in, and keeps others on the team without it', async () => {
    const owner = t.owner();
    const tuya = await owner.users.add({ fullName: 'Tuya' });

    await expect(owner.users.allowSignIn({ id: tuya.id })).rejects.toMatchObject({
      code: 'EMAIL_REQUIRED',
    });
    expect(await owner.users.allowSignIn({ id: tuya.id, email: 'tuya@acme.mn' })).toMatchObject({
      email: 'tuya@acme.mn',
      canSignIn: true,
      status: 'invited',
    });

    // The active member stops signing in: their session ends, their email stays.
    expect((await t.member().auth.me({})).user.id).toBe(t.ids.member);
    expect(await owner.users.stopSignIn({ id: t.ids.member })).toMatchObject({
      canSignIn: false,
      status: 'active',
      email: 'member@acme.mn',
    });
    await expect(t.member().auth.me({})).rejects.toMatchObject({ status: 401 });
    // Their email may go now; whoever signs in keeps one.
    expect((await owner.users.update({ id: t.ids.member, email: null })).email).toBeNull();
    await expect(owner.users.update({ id: tuya.id, email: null })).rejects.toMatchObject({
      code: 'EMAIL_REQUIRED',
    });
    await expect(owner.users.stopSignIn({ id: t.ids.owner })).rejects.toMatchObject({
      status: 403,
    });
  });

  it('lets a plugin add and change only the members who do not sign in', async () => {
    const hr = t.hr();
    const worker = await hr.users.add({ fullName: 'Ganaa', phone: '+97699112233' });

    expect(worker).toMatchObject({ canSignIn: false, role: 'member' });
    expect((await hr.users.update({ id: worker.id, employeeId: 'E-9' })).employeeId).toBe('E-9');
    expect((await hr.users.disable({ id: worker.id })).status).toBe('disabled');
    expect((await hr.users.enable({ id: worker.id })).status).toBe('active');

    // Never an account that signs in, never a role.
    await expect(
      hr.users.update({ id: t.ids.owner, fullName: 'Taken over' }),
    ).rejects.toMatchObject({ status: 403 });
    await expect(hr.users.disable({ id: t.ids.owner })).rejects.toMatchObject({ status: 403 });
    await expect(hr.users.update({ id: worker.id, role: 'admin' })).rejects.toMatchObject({
      status: 403,
    });
    await expect(hr.users.add({ fullName: 'Boss', role: 'admin' })).rejects.toMatchObject({
      status: 403,
    });
    await expect(hr.users.allowSignIn({ id: worker.id, email: 'g@acme.mn' })).rejects.toMatchObject(
      { status: 403 },
    );
  });
});
