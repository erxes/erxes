import * as faker from 'faker';
import { connect, disconnect, graphqlRequest } from '../db/connection';
import { segmentFactory, userFactory } from '../db/factories';
import { Segments, Users } from '../db/models';

beforeAll(() => connect());

afterAll(() => disconnect());

const toJSON = value => {
  return JSON.stringify(value);
};

describe('Segments mutations', () => {
  let _user;
  let _segment;
  let context;

  const commonParamDefs = `
    $name: String!
    $description: String
    $subOf: String
    $color: String
    $connector: String
    $conditions: [SegmentCondition]
  `;

  const commonParams = `
    name: $name
    description: $description
    subOf: $subOf
    color: $color
    connector: $connector
    conditions: $conditions
  `;

  beforeEach(async () => {
    // Creating test data
    _user = await userFactory({});
    _segment = await segmentFactory({});

    context = { user: _user };
  });

  afterEach(async () => {
    // Clearing test data
    await Segments.remove({});
    await Users.remove({});
  });

  test('Add segment', async () => {
    const { contentType, name, description, color, connector } = _segment;
    const subOf = _segment.subOf || faker.random.word();
    const args = {
      contentType,
      name,
      description,
      subOf,
      color,
      connector,
      conditions: [
        {
          field: faker.random.word(),
          operator: faker.random.word(),
          value: faker.random.word(),
          dateUnit: faker.random.word(),
          type: faker.random.word(),
        },
      ],
    };

    const mutation = `
      mutation segmentsAdd($contentType: String! ${commonParamDefs}) {
        segmentsAdd(contentType: $contentType ${commonParams}) {
          contentType
          name
          description
          subOf
          color
          connector
          conditions
        }
      }
    `;

    const segment = await graphqlRequest(mutation, 'segmentsAdd', args, context);

    expect(segment.contentType).toBe(args.contentType);
    expect(segment.name).toBe(args.name);
    expect(segment.description).toBe(args.description);
    expect(segment.subOf).toBe(args.subOf);
    expect(segment.color).toBe(args.color);
    expect(segment.connector).toBe(args.connector);
    expect(toJSON(segment.conditions)).toEqual(toJSON(args.conditions));
  });

  test('segmentsEdit', async () => {
    const { _id, name, description, color, connector } = _segment;
    const subOf = _segment.subOf || faker.random.word();
    const args = {
      _id,
      name,
      description,
      subOf,
      color,
      connector,
      conditions: [
        {
          type: faker.random.word(),
          dateUnit: faker.random.word(),
          value: faker.random.word(),
          operator: faker.random.word(),
          field: faker.random.word(),
        },
      ],
    };

    const mutation = `
      mutation segmentsEdit($_id: String! ${commonParamDefs}) {
        segmentsEdit(_id: $_id ${commonParams}) {
          _id
          name
          description
          subOf
          color
          connector
          conditions
        }
      }
    `;

    const segment = await graphqlRequest(mutation, 'segmentsEdit', args, context);

    expect(segment._id).toBe(args._id);
    expect(segment.name).toBe(args.name);
    expect(segment.description).toBe(args.description);
    expect(segment.subOf).toBe(args.subOf);
    expect(segment.color).toBe(args.color);
    expect(segment.connector).toBe(args.connector);
    expect(toJSON(segment.conditions)).toEqual(toJSON(args.conditions));
  });

  test('Remove segment', async () => {
    const mutation = `
      mutation segmentsRemove($_id: String!) {
        segmentsRemove(_id: $_id)
      }
    `;

    await graphqlRequest(mutation, 'segmentsRemove', { _id: _segment._id }, context);

    expect(await Segments.findOne({ _id: _segment._id })).toBe(null);
  });
});
