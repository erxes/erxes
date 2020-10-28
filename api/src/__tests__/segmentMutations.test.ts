import * as faker from 'faker';
import { graphqlRequest } from '../db/connection';
import { segmentFactory, userFactory } from '../db/factories';
import { Segments, Users } from '../db/models';

import './setup.ts';

const toJSON = value => {
  return JSON.stringify(value, Object.keys(value).sort());
};

describe('Segments mutations', () => {
  let _user;
  let _segment;
  let context;
  let parentSegment;

  const commonParamDefs = `
    $name: String!
    $description: String
    $subOf: String
    $color: String
    $conditions: [SegmentCondition]
  `;

  const commonParams = `
    name: $name
    description: $description
    subOf: $subOf
    color: $color
    conditions: $conditions
  `;

  beforeEach(async () => {
    // Creating test data
    parentSegment = await segmentFactory();
    _user = await userFactory({});
    _segment = await segmentFactory({ subOf: parentSegment._id });

    context = { user: _user };
  });

  afterEach(async () => {
    // Clearing test data
    await Segments.deleteMany({});
    await Users.deleteMany({});
  });

  test('Add segment', async () => {
    const { contentType, name, description, color } = _segment;
    const subOf = _segment.subOf || faker.random.word();
    const args = {
      contentType,
      name,
      description,
      subOf,
      color,
      conditions: [
        {
          propertyName: faker.random.word(),
          propertyOperator: faker.random.word(),
          propertyValue: faker.random.word(),
          type: 'property'
        }
      ]
    };

    const mutation = `
      mutation segmentsAdd($contentType: String! ${commonParamDefs}) {
        segmentsAdd(contentType: $contentType ${commonParams}) {
          contentType
          name
          description
          subOf
          color
          conditions
        }
      }
    `;

    const segment = await graphqlRequest(
      mutation,
      'segmentsAdd',
      args,
      context
    );

    expect(segment.contentType).toBe(args.contentType);
    expect(segment.name).toBe(args.name);
    expect(segment.description).toBe(args.description);
    expect(segment.subOf).toBe(args.subOf);
    expect(segment.color).toBe(args.color);
    expect(toJSON(segment.conditions)).toEqual(toJSON(args.conditions));
  });

  test('segmentsEdit', async () => {
    const { _id, name, description, color } = _segment;
    const secondParent = await segmentFactory();

    const args = {
      _id,
      name,
      description,
      subOf: secondParent._id,
      color,
      conditions: [
        {
          type: 'property',
          propertyValue: faker.random.word(),
          propertyOperator: faker.random.word(),
          propertyName: faker.random.word()
        }
      ]
    };

    const mutation = `
      mutation segmentsEdit($_id: String! ${commonParamDefs}) {
        segmentsEdit(_id: $_id ${commonParams}) {
          _id
          name
          description
          subOf
          color
          conditions
        }
      }
    `;

    const segment = await graphqlRequest(
      mutation,
      'segmentsEdit',
      args,
      context
    );

    expect(segment._id).toBe(args._id);
    expect(segment.name).toBe(args.name);
    expect(segment.description).toBe(args.description);
    expect(segment.subOf).toBe(args.subOf);
    expect(segment.color).toBe(args.color);
    expect(toJSON(segment.conditions)).toEqual(toJSON(args.conditions));
  });

  test('Remove segment', async () => {
    const mutation = `
      mutation segmentsRemove($_id: String!) {
        segmentsRemove(_id: $_id)
      }
    `;

    await graphqlRequest(
      mutation,
      'segmentsRemove',
      { _id: _segment._id },
      context
    );

    expect(await Segments.findOne({ _id: _segment._id })).toBe(null);
  });
});
