import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, expect, it } from 'vitest';
import { createApp } from '~/app';
import { signAccessToken } from '~/http/auth';
import { createOrganization } from '~/modules/organizations/organizations.service';
import { adminDb, describeWithDb, useTestDatabase } from './db';

describeWithDb('field groups, archiving and field settings', () => {
  useTestDatabase();

  let server: Server;
  let base = '';
  let ownerToken = '';
  let memberToken = '';
  let otherOrgToken = '';

  beforeAll(async () => {
    const { db, users, newId } = await import('@erxes/core-db');
    const acme = await createOrganization({ subdomain: 'acme', name: 'Acme', owner: { email: 'owner@acme.mn' } });
    const globex = await createOrganization({ subdomain: 'globex', name: 'Globex', owner: { email: 'owner@globex.mn' } });
    const memberId = newId();

    await adminDb().insert(users).values({ id: memberId, orgId: acme.organization.id, email: 'member@acme.mn', status: 'active' });

    ownerToken = signAccessToken(acme.owner.id, acme.organization.id);
    memberToken = signAccessToken(memberId, acme.organization.id);
    otherOrgToken = signAccessToken(globex.owner.id, globex.organization.id);
    server = createApp().listen(0);
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  afterAll(() => new Promise<void>((resolve) => server.close(() => resolve())));

  interface Body {
    id: string;
    code: string | null;
    name: string;
    label: string;
    type: string;
    groupId: string | null;
    order: number;
    options: string[] | Record<string, Record<string, number>>;
    validation: string | null;
    isVisible: boolean;
    archivedAt: string | null;
    customFields: Record<string, unknown>;
    records: number;
    removable: boolean;
    data: { id: string; order: number; groupId?: string | null; archivedAt: string | null }[];
  }

  const call = async (token: string, method: string, path: string, body?: unknown) => {
    const response = await fetch(`${base}/core/v1${path}`, {
      method,
      headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    return { status: response.status, body: (await response.json()) as Body };
  };

  const ids = (body: Body) => body.data.map((item) => item.id);

  it('creates groups with a code from the name, in order; only owners and admins manage them', async () => {
    expect((await call(memberToken, 'POST', '/field-groups', { contentType: 'customer', name: 'Loyalty' })).status).toBe(
      403,
    );

    const loyalty = await call(ownerToken, 'POST', '/field-groups', { contentType: 'customer', name: 'Loyalty Club' });
    const billing = await call(ownerToken, 'POST', '/field-groups', {
      contentType: 'customer',
      name: 'Billing',
      code: 'billing',
    });

    expect(loyalty.status).toBe(201);
    expect(loyalty.body).toMatchObject({ code: 'loyalty_club', order: 0, archivedAt: null });
    expect(billing.body.order).toBe(1);
    expect(
      (await call(ownerToken, 'POST', '/field-groups', { contentType: 'customer', name: 'Other', code: 'BILLING' }))
        .body,
    ).toMatchObject({ code: 'FIELD_GROUP_EXISTS' });
    expect(
      (await call(ownerToken, 'POST', '/field-groups', { contentType: 'customer', name: 'Хэрэглэгч' })).status,
    ).toBe(400);

    // Another organisation sees none of them.
    expect((await call(otherOrgToken, 'GET', '/field-groups?contentType=customer')).body.data).toEqual([]);

    await call(ownerToken, 'POST', '/field-groups/order', {
      orders: [
        { id: loyalty.body.id, order: 1 },
        { id: billing.body.id, order: 0 },
      ],
    });
    expect(ids((await call(memberToken, 'GET', '/field-groups?contentType=customer')).body)).toEqual([
      billing.body.id,
      loyalty.body.id,
    ]);
  });

  it('puts fields in a group of their record type, with code, visibility and validation', async () => {
    const group = (await call(ownerToken, 'POST', '/field-groups', { contentType: 'customer', name: 'Contact' })).body;
    const companyGroup = (await call(ownerToken, 'POST', '/field-groups', { contentType: 'company', name: 'Contact' }))
      .body;

    expect(
      (
        await call(ownerToken, 'POST', '/fields', {
          contentType: 'customer',
          label: 'Wrong group',
          type: 'text',
          groupId: companyGroup.id,
        })
      ).body,
    ).toMatchObject({ code: 'INVALID_FIELD_GROUP' });

    const email = await call(ownerToken, 'POST', '/fields', {
      contentType: 'customer',
      label: 'Work email',
      type: 'text',
      groupId: group.id,
      code: 'work_email',
      validation: 'email',
      icon: 'IconMail',
      isVisible: false,
    });

    expect(email.status).toBe(201);
    expect(email.body).toMatchObject({
      groupId: group.id,
      code: 'work_email',
      validation: 'email',
      isVisible: false,
      archivedAt: null,
    });
    expect(
      (
        await call(ownerToken, 'POST', '/fields', {
          contentType: 'customer',
          label: 'Another',
          type: 'text',
          code: 'WORK_EMAIL',
        })
      ).body,
    ).toMatchObject({ code: 'FIELD_EXISTS', message: 'A field with this code already exists' });

    const phone = await call(ownerToken, 'POST', '/fields', { contentType: 'customer', label: 'Desk', type: 'phone' });
    const sizes = await call(ownerToken, 'POST', '/fields', {
      contentType: 'customer',
      label: 'Sizes',
      type: 'check',
      options: ['S', 'M', 'L'],
    });
    const notes = await call(ownerToken, 'POST', '/fields', { contentType: 'customer', label: 'Notes', type: 'list' });

    const bad = await call(ownerToken, 'POST', '/customers', {
      firstName: 'Bat',
      customFields: { [email.body.id]: 'not-an-email' },
    });
    expect(bad.body).toMatchObject({ code: 'INVALID_FIELD_VALUE' });

    const customer = await call(ownerToken, 'POST', '/customers', {
      firstName: 'Bat',
      customFields: {
        [email.body.id]: 'bat@acme.mn',
        [phone.body.id]: '+976 9911 2233',
        [sizes.body.id]: ['S', 'L', 'S'],
        [notes.body.id]: [' first ', '', 'second'],
      },
    });

    expect(customer.status).toBe(201);
    expect(customer.body.customFields).toEqual({
      [email.body.id]: 'bat@acme.mn',
      [phone.body.id]: '+976 9911 2233',
      [sizes.body.id]: ['S', 'L'],
      [notes.body.id]: ['first', 'second'],
    });
    expect(
      (await call(ownerToken, 'PATCH', `/customers/${customer.body.id}`, { customFields: { [phone.body.id]: 'abc' } }))
        .body,
    ).toMatchObject({ code: 'INVALID_FIELD_VALUE' });

    // Usage counts records and, for option fields, each option.
    const usage = await call(memberToken, 'GET', `/fields/usage?ids=${sizes.body.id},${email.body.id}`);
    expect(usage.body).toMatchObject({ records: 1, removable: false, options: { [sizes.body.id]: { S: 1, L: 1 } } });
    expect((await call(memberToken, 'GET', `/fields/usage?groupId=${group.id}`)).body).toMatchObject({ records: 1 });

    // In use: the type changes only within types sharing a stored value.
    expect((await call(ownerToken, 'PATCH', `/fields/${sizes.body.id}`, { type: 'multiselect' })).body.type).toBe(
      'multiselect',
    );
    expect((await call(ownerToken, 'PATCH', `/fields/${sizes.body.id}`, { type: 'number' })).body).toMatchObject({
      code: 'FIELD_IN_USE',
    });
    // Unused: anything goes; options are needed for option types and dropped otherwise.
    const free = (await call(ownerToken, 'POST', '/fields', { contentType: 'customer', label: 'Free', type: 'text' }))
      .body;
    expect((await call(ownerToken, 'PATCH', `/fields/${free.id}`, { type: 'radio' })).status).toBe(400);
    expect(
      (await call(ownerToken, 'PATCH', `/fields/${free.id}`, { type: 'radio', options: ['A', 'B'] })).body,
    ).toMatchObject({ type: 'radio', options: ['A', 'B'], validation: null });

    // Moved into a group, hidden, with a validation dropped for non-text types.
    const moved = await call(ownerToken, 'PATCH', `/fields/${phone.body.id}`, {
      groupId: group.id,
      isVisible: false,
      validation: 'number',
    });
    expect(moved.body).toMatchObject({ groupId: group.id, isVisible: false, validation: null });
    expect(
      (await call(ownerToken, 'PATCH', `/fields/${phone.body.id}`, { groupId: companyGroup.id })).body,
    ).toMatchObject({ code: 'INVALID_FIELD_GROUP' });

    const inGroup = await call(memberToken, 'GET', `/fields?contentType=customer&groupId=${group.id}`);
    expect(ids(inGroup.body)).toEqual([email.body.id, phone.body.id]);

    await call(ownerToken, 'POST', '/fields/order', {
      orders: [
        { id: email.body.id, order: phone.body.order },
        { id: phone.body.id, order: email.body.order },
      ],
    });
    expect(ids((await call(memberToken, 'GET', `/fields?contentType=customer&groupId=${group.id}`)).body)).toEqual([
      phone.body.id,
      email.body.id,
    ]);
  });

  it('archives and restores fields; archived ones keep values and can only be cleared', async () => {
    const field = (await call(ownerToken, 'POST', '/fields', { contentType: 'company', label: 'Region', type: 'text' }))
      .body;
    const company = (
      await call(ownerToken, 'POST', '/companies', { primaryName: 'Archive LLC', customFields: { [field.id]: 'North' } })
    ).body;

    expect((await call(memberToken, 'POST', '/fields/archive', { ids: [field.id] })).status).toBe(403);
    expect((await call(ownerToken, 'POST', '/fields/archive', { ids: [field.id] })).status).toBe(200);

    expect(ids((await call(ownerToken, 'GET', '/fields?contentType=company')).body)).not.toContain(field.id);
    const archived = (await call(ownerToken, 'GET', '/fields?contentType=company&archived=true')).body;
    expect(archived.data.find((item) => item.id === field.id)?.archivedAt).toBeTruthy();

    expect((await call(ownerToken, 'GET', `/companies/${company.id}`)).body.customFields).toEqual({ [field.id]: 'North' });
    expect(
      (await call(ownerToken, 'PATCH', `/companies/${company.id}`, { customFields: { [field.id]: 'South' } })).body,
    ).toMatchObject({ code: 'INVALID_FIELD' });

    // Records hold values: it cannot be deleted through the "unused" path.
    expect((await call(ownerToken, 'POST', '/fields/remove', { ids: [field.id] })).body).toMatchObject({
      code: 'FIELD_IN_USE',
    });

    const restored = await call(ownerToken, 'POST', `/fields/${field.id}/restore`, {});
    expect(restored.body.archivedAt).toBeNull();
    expect(
      (await call(ownerToken, 'PATCH', `/companies/${company.id}`, { customFields: { [field.id]: 'South' } })).body
        .customFields,
    ).toEqual({ [field.id]: 'South' });

    await call(ownerToken, 'PATCH', `/companies/${company.id}`, { customFields: { [field.id]: null } });
    expect((await call(ownerToken, 'POST', '/fields/remove', { ids: [field.id] })).status).toBe(200);
    expect((await call(ownerToken, 'GET', '/fields/usage?ids=' + field.id)).body).toMatchObject({ records: 0 });
  });

  it('archives a group with its fields, and deletes it only while no record holds their values', async () => {
    const group = (await call(ownerToken, 'POST', '/field-groups', { contentType: 'company', name: 'Finance' })).body;
    const field = (
      await call(ownerToken, 'POST', '/fields', {
        contentType: 'company',
        label: 'Budget',
        type: 'number',
        groupId: group.id,
      })
    ).body;
    const company = (
      await call(ownerToken, 'POST', '/companies', { primaryName: 'Group LLC', customFields: { [field.id]: 10 } })
    ).body;

    const archived = await call(ownerToken, 'POST', `/field-groups/${group.id}/archive`, {});
    expect(archived.body.archivedAt).toBeTruthy();
    expect(ids((await call(ownerToken, 'GET', '/field-groups?contentType=company')).body)).not.toContain(group.id);
    expect(ids((await call(ownerToken, 'GET', '/field-groups?contentType=company&archived=true')).body)).toEqual([
      group.id,
    ]);
    // Its fields count as archived while it is.
    expect(ids((await call(ownerToken, 'GET', '/fields?contentType=company')).body)).not.toContain(field.id);
    expect(ids((await call(ownerToken, 'GET', '/fields?contentType=company&archived=true')).body)).toContain(field.id);
    expect(
      (await call(ownerToken, 'PATCH', `/companies/${company.id}`, { customFields: { [field.id]: 20 } })).body,
    ).toMatchObject({ code: 'INVALID_FIELD' });
    expect(
      (await call(ownerToken, 'POST', '/fields', {
        contentType: 'company',
        label: 'Late',
        type: 'text',
        groupId: group.id,
      })).body,
    ).toMatchObject({ code: 'INVALID_FIELD_GROUP' });

    expect((await call(ownerToken, 'DELETE', `/field-groups/${group.id}`)).body).toMatchObject({ code: 'FIELD_IN_USE' });

    await call(ownerToken, 'POST', `/field-groups/${group.id}/restore`, {});
    expect(ids((await call(ownerToken, 'GET', '/fields?contentType=company')).body)).toContain(field.id);

    await call(ownerToken, 'PATCH', `/companies/${company.id}`, { customFields: { [field.id]: null } });
    expect((await call(memberToken, 'DELETE', `/field-groups/${group.id}`)).status).toBe(403);
    expect((await call(ownerToken, 'DELETE', `/field-groups/${group.id}`)).status).toBe(200);
    expect(ids((await call(ownerToken, 'GET', '/fields?contentType=company')).body)).not.toContain(field.id);
    expect((await call(otherOrgToken, 'DELETE', `/field-groups/${group.id}`)).status).toBe(404);
  });

  it('keeps the old field API working: no group, DELETE removes values', async () => {
    const field = (await call(ownerToken, 'POST', '/fields', { contentType: 'customer', label: 'Legacy', type: 'text' }))
      .body;
    const customer = (
      await call(ownerToken, 'POST', '/customers', { firstName: 'Old', customFields: { [field.id]: 'kept' } })
    ).body;

    expect(field).toMatchObject({ groupId: null, code: null, isVisible: true, archivedAt: null });
    expect((await call(ownerToken, 'DELETE', `/fields/${field.id}`)).status).toBe(200);
    expect((await call(ownerToken, 'GET', `/customers/${customer.id}`)).body.customFields).toEqual({});
  });
});
