/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect } from '../db/connection';
import { Fields } from '../db/models';
import { formFactory, fieldFactory } from '../db/factories';

beforeAll(() => connect());

afterAll(() => disconnect());

/**
 * Field related tests
 */
describe('Fields', () => {
  beforeEach(async () => {
    // creating field with contentType other than customer
    await fieldFactory({ contentType: 'form', order: 1 });
  });

  afterEach(() => {
    // Clearing test fields
    return Fields.remove({});
  });

  test('createField() without contentTypeId', async () => {
    // first attempt
    let field = await Fields.createField({ contentType: 'customer' });
    expect(field.order).toBe(0);

    // second attempt
    field = await Fields.createField({ contentType: 'customer' });
    expect(field.order).toBe(1);

    // third attempt
    field = await Fields.createField({ contentType: 'customer' });
    expect(field.order).toBe(2);
  });

  test('createField() with contentTypeId', async () => {
    const contentType = 'form';
    const form1 = await formFactory({});
    const form2 = await formFactory({});

    // first attempt
    let field = await Fields.createField({ contentType, contentTypeId: form1._id });
    expect(field.order).toBe(0);

    // second attempt
    field = await Fields.createField({ contentType, contentTypeId: form1._id });
    expect(field.order).toBe(1);

    // must create new order
    field = await Fields.createField({ contentType, contentTypeId: form2._id });
    expect(field.order).toBe(0);
  });

  test('createField() required contentTypeId when form', async () => {
    expect.assertions(1);

    try {
      await Fields.createField({ contentType: 'form' });
    } catch (e) {
      expect(e.message).toEqual('Content type id is required');
    }
  });

  test('createField() check contentTypeId existence', async () => {
    expect.assertions(1);

    try {
      await Fields.createField({ contentType: 'form', contentTypeId: 'DFAFDFADS' });
    } catch (e) {
      expect(e.message).toEqual('Form not found with _id of DFAFDFADS');
    }
  });
});
