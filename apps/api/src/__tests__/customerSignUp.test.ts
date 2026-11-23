import { describe, expect, it } from 'vite-plus/test';
import { lastCode, useCustomers } from './customerAuth.fixture';
import { useTestDatabase } from './db';

/** Sign-up forms, and the customer fields customers fill in themselves (decision 42). */
describe('customer sign-up', { timeout: 300_000 }, () => {
  useTestDatabase();

  const t = useCustomers();

  // Before the next test adds a required field.
  it("keeps staff's data when a customer erxes knew signs up", async () => {
    const known = await t.owner().customers.create({
      firstName: 'Saraa',
      primaryEmail: 'known@example.com',
    });

    const { api } = t.app();

    await api.customerAuth.signUp({
      kind: 'email',
      value: 'known@example.com',
      firstName: 'Someone else',
      lastName: 'Gantulga',
    });

    expect(
      await api.customerAuth.confirmSignUp({
        kind: 'email',
        value: 'known@example.com',
        code: await lastCode('known@example.com'),
      }),
    ).toMatchObject({
      created: false,
      customer: { id: known.id, firstName: 'Saraa', lastName: 'Gantulga' },
    });
  });

  it('checks the sign-up form against the fields customers may fill in', async () => {
    const owner = t.owner();

    const size = await owner.fields.create({
      contentType: 'customer',
      label: 'Shoe size',
      type: 'number',
      isRequired: true,
      customerEditable: true,
    });

    const secret = await owner.fields.create({
      contentType: 'customer',
      label: 'Credit limit',
      type: 'number',
    });

    // Only customer fields can be theirs.
    await expect(
      owner.fields.create({
        contentType: 'company',
        label: 'Team size',
        type: 'number',
        customerEditable: true,
      }),
    ).rejects.toMatchObject({ status: 400 });

    const { api } = t.app();

    expect(await api.customerAuth.fields()).toMatchObject({
      data: [{ id: size.id, label: 'Shoe size', type: 'number', isRequired: true }],
    });

    const form = { kind: 'email', value: 'shoes@example.com' } as const;

    await expect(api.customerAuth.signUp({ ...form, firstName: 'Anu' })).rejects.toMatchObject({
      status: 400,
      code: 'INVALID_FIELD',
      data: { fieldId: size.id },
    });
    await expect(
      api.customerAuth.signUp({
        ...form,
        firstName: 'Anu',
        customFields: { [size.id]: 38, [secret.id]: 1_000_000 },
      }),
    ).rejects.toMatchObject({ status: 400, code: 'INVALID_FIELD', data: { fieldId: secret.id } });
    await expect(
      api.customerAuth.signUp({ ...form, firstName: 'Anu', customFields: { [size.id]: 'big' } }),
    ).rejects.toMatchObject({ status: 400 });

    await api.customerAuth.signUp({ ...form, firstName: 'Anu', customFields: { [size.id]: 38 } });

    const joined = await api.customerAuth.confirmSignUp({
      ...form,
      code: await lastCode('shoes@example.com'),
    });

    expect(joined.customer).toMatchObject({ firstName: 'Anu', customFields: { [size.id]: 38 } });

    // Staff's own fields stay out of the customer's sight and reach.
    await owner.customers.update({ id: joined.customer.id, customFields: { [secret.id]: 500 } });

    const me = t.app({ token: joined.accessToken }).api;

    expect((await me.customerAccount.me({})).customFields).toEqual({ [size.id]: 38 });
    expect(
      await me.customerAccount.update({ lastName: 'Dorj', customFields: { [size.id]: 39 } }),
    ).toMatchObject({ lastName: 'Dorj', customFields: { [size.id]: 39 } });
    await expect(
      me.customerAccount.update({ customFields: { [secret.id]: 9_000_000 } }),
    ).rejects.toMatchObject({ status: 400, code: 'INVALID_FIELD' });
  });
});
