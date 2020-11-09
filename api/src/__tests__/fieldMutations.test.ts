import * as faker from 'faker';
import { graphqlRequest } from '../db/connection';
import { fieldFactory, fieldGroupFactory, userFactory } from '../db/factories';
import { Fields, FieldsGroups, Users } from '../db/models';

import './setup.ts';

/*
 * Generate test data
 */
const fieldArgs = {
  contentType: faker.random.word(),
  contentTypeId: faker.random.word(),
  validation: 'number',
  type: 'text',
  description: faker.random.word(),
  options: [],
  isRequired: false,
  order: faker.random.number(),
  groupId: faker.random.word(),
  isVisible: false
};

const fieldGroupArgs = {
  name: faker.random.word(),
  contentType: 'customer',
  order: 2,
  description: faker.random.word(),
  isVisible: true
};

describe('Fields mutations', () => {
  let _user;
  let _field;
  let _fieldGroup;
  let context;

  const fieldsCommonParamDefs = `
    $type: String
    $validation: String
    $text: String
    $description: String
    $options: [String]
    $isRequired: Boolean
    $order: Int
    $groupId: String
    $isVisible: Boolean
  `;

  const fieldsCommonParams = `
    type: $type
    validation: $validation
    text: $text
    description: $description
    options: $options
    isRequired: $isRequired
    order: $order
    groupId: $groupId
    isVisible: $isVisible
  `;

  const fieldsGroupsCommonParamDefs = `
    $name: String
    $contentType: String
    $order: Int
    $description: String
    $isVisible: Boolean
  `;

  const fieldsGroupsCommonParams = `
    name: $name
    contentType: $contentType
    order: $order
    description: $description
    isVisible: $isVisible
  `;

  beforeEach(async () => {
    // Creating test data
    _user = await userFactory({});
    _field = await fieldFactory({});
    _fieldGroup = await fieldGroupFactory({});

    context = { user: _user };
  });

  afterEach(async () => {
    // Clearing test data
    await Users.deleteMany({});
    await Fields.deleteMany({});
    await FieldsGroups.deleteMany({});
  });

  test('Add field', async () => {
    const mutation = `
      mutation fieldsAdd(
        $contentType: String!
        $contentTypeId: String
        ${fieldsCommonParamDefs}
      ) {
        fieldsAdd(
          contentType: $contentType
          contentTypeId: $contentTypeId
          ${fieldsCommonParams}
        ) {
          contentType
          contentTypeId
          type
          validation
          description
          options
          isRequired
          order
          groupId
          isVisible
        }
      }
    `;

    const field = await graphqlRequest(
      mutation,
      'fieldsAdd',
      fieldArgs,
      context
    );

    expect(field.contentType).toBe(fieldArgs.contentType);
    expect(field.contentTypeId).toBe(fieldArgs.contentTypeId);
    expect(field.validation).toBe(fieldArgs.validation);
    expect(field.type).toBe(fieldArgs.type);
    expect(field.description).toBe(fieldArgs.description);
    expect(field.options).toEqual(fieldArgs.options);
    expect(field.isRequired).toEqual(fieldArgs.isRequired);
    expect(field.order).toBe(fieldArgs.order);
    expect(field.groupId).toBe(fieldArgs.groupId);
    expect(field.isVisible).toBe(fieldArgs.isVisible);
  });

  test('Edit field', async () => {
    const mutation = `
      mutation fieldsEdit(
        $_id: String!
        ${fieldsCommonParamDefs}
      ) {
        fieldsEdit(
          _id: $_id
          ${fieldsCommonParams}
        ) {
          _id
          type
          validation
          description
          options
          isRequired
          order
          groupId
          isVisible
        }
      }
    `;

    const field = await graphqlRequest(
      mutation,
      'fieldsEdit',
      { _id: _field._id, ...fieldArgs },
      context
    );

    expect(field._id).toBe(_field._id);
    expect(field.validation).toBe(fieldArgs.validation);
    expect(field.type).toBe(fieldArgs.type);
    expect(field.description).toBe(fieldArgs.description);
    expect(field.options).toEqual(fieldArgs.options);
    expect(field.isRequired).toEqual(fieldArgs.isRequired);
    expect(field.order).toBe(fieldArgs.order);
    expect(field.groupId).toBe(fieldArgs.groupId);
    expect(field.isVisible).toBe(fieldArgs.isVisible);
  });

  test('Remove field', async () => {
    const mutation = `
      mutation fieldsRemove($_id: String!) {
        fieldsRemove(_id: $_id) {
          _id
        }
      }
    `;

    await graphqlRequest(
      mutation,
      'fieldsRemove',
      { _id: _field._id },
      context
    );

    expect(await Fields.findOne({ _id: _field._id })).toBe(null);
  });

  test('Update order field', async () => {
    const orders = [
      {
        _id: _field._id,
        order: 1
      }
    ];

    const mutation = `
      mutation fieldsUpdateOrder($orders: [OrderItem]) {
        fieldsUpdateOrder(orders: $orders) {
          _id
          order
        }
      }
    `;

    const [fields] = await graphqlRequest(
      mutation,
      'fieldsUpdateOrder',
      { orders },
      context
    );

    const orderIds = orders.map(order => order._id);
    const orderItems = orders.map(item => item.order);

    expect(orderIds).toContain(fields._id);
    expect(orderItems).toContain(fields.order);
  });

  test('Update field visible', async () => {
    const args = {
      _id: _field._id,
      isVisible: _field.isVisible
    };

    const mutation = `
      mutation fieldsUpdateVisible($_id: String! $isVisible: Boolean) {
        fieldsUpdateVisible(_id: $_id isVisible: $isVisible) {
          _id
          isVisible
        }
      }
    `;

    const field = await graphqlRequest(
      mutation,
      'fieldsUpdateVisible',
      args,
      context
    );

    expect(field._id).toBe(args._id);
    expect(field.isVisible).toBe(args.isVisible);
  });

  test('Add group field', async () => {
    const mutation = `
      mutation fieldsGroupsAdd(${fieldsGroupsCommonParamDefs}) {
        fieldsGroupsAdd(${fieldsGroupsCommonParams}) {
          name
          contentType
          order
          description
          isVisible
        }
      }
    `;

    const fieldGroup = await graphqlRequest(
      mutation,
      'fieldsGroupsAdd',
      fieldGroupArgs
    );

    expect(fieldGroup.contentType).toBe(fieldGroupArgs.contentType);
    expect(fieldGroup.name).toBe(fieldGroupArgs.name);
    expect(fieldGroup.description).toBe(fieldGroupArgs.description);
    expect(fieldGroup.order).toBe(1);
    expect(fieldGroup.isVisible).toBe(fieldGroupArgs.isVisible);
  });

  test('Edit group field', async () => {
    const mutation = `
      mutation fieldsGroupsEdit($_id: String! ${fieldsGroupsCommonParamDefs}) {
        fieldsGroupsEdit(_id: $_id ${fieldsGroupsCommonParams}) {
          _id
          name
          contentType
          order
          description
          isVisible
        }
      }
    `;

    const fieldGroup = await graphqlRequest(
      mutation,
      'fieldsGroupsEdit',
      { _id: _fieldGroup._id, ...fieldGroupArgs },
      context
    );

    expect(fieldGroup._id).toBe(_fieldGroup._id);
    expect(fieldGroup.contentType).toBe(fieldGroupArgs.contentType);
    expect(fieldGroup.name).toBe(fieldGroupArgs.name);
    expect(fieldGroup.description).toBe(fieldGroupArgs.description);
    expect(fieldGroup.order).toBe(fieldGroupArgs.order);
    expect(fieldGroup.isVisible).toBe(fieldGroupArgs.isVisible);
  });

  test('Remove group field', async () => {
    const mutation = `
      mutation fieldsGroupsRemove($_id: String!) {
        fieldsGroupsRemove(_id: $_id)
      }
    `;

    await graphqlRequest(
      mutation,
      'fieldsGroupsRemove',
      { _id: _fieldGroup._id },
      context
    );
    expect(await FieldsGroups.findOne({ _id: _fieldGroup._id })).toBe(null);
  });

  test('Update group field visible', async () => {
    const args = {
      _id: _fieldGroup._id,
      isVisible: true
    };

    const mutation = `
      mutation fieldsGroupsUpdateVisible($_id: String, $isVisible: Boolean) {
        fieldsGroupsUpdateVisible(_id: $_id isVisible: $isVisible) {
          _id
          isVisible
        }
      }
    `;

    const fieldGroup = await graphqlRequest(
      mutation,
      'fieldsGroupsUpdateVisible',
      args,
      context
    );

    expect(fieldGroup._id).toBe(args._id);
    expect(fieldGroup.isVisible).toBe(args.isVisible);
  });
});
