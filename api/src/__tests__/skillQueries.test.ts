import { graphqlRequest } from '../db/connection';
import { skillFactor, skillTypeFactor } from '../db/factories';
import { Skills, SkillTypes } from '../db/models';
import './setup';

describe('skillTypeQueries', () => {
  beforeEach(async () => {
    await skillTypeFactor({});
    await skillTypeFactor({});
    await skillTypeFactor({});
  });

  afterEach(async () => {
    await SkillTypes.deleteMany({});
  });

  test('skillTypes', async () => {
    const qry = `
      query skillTypes {
        skillTypes {
          _id
        }
      }
    `;

    const response = await graphqlRequest(qry, 'skillTypes');

    expect(response.length).toBe(3);
  });

  test('skillTypesTotalCount', async () => {
    const qry = `
      query skillTypesTotalCount {
        skillTypesTotalCount
      }
    `;

    const response = await graphqlRequest(qry, 'skillTypesTotalCount');

    expect(response).toBe(3);
  });
});

describe('skillsQueries', () => {
  afterEach(async () => {
    await Skills.deleteMany({});
  });

  test('skill', async () => {
    const skill = await skillFactor({});

    const qry = `
      query skill($_id: String!) {
        skill(_id: $_id) {
          _id
        }
      }
    `;

    const response = await graphqlRequest(qry, 'skill', { _id: skill._id });

    expect(response._id).toBe(skill._id);
  });

  test('skills', async () => {
    // by memberIds
    await skillFactor({ memberIds: ['123'] });
    await skillFactor({ memberIds: ['123'] });
    await skillFactor({ memberIds: ['123'] });

    // typeId, not in memberIds
    await skillFactor({ memberIds: ['321'], typeId: 'typeId' });
    await skillFactor({ memberIds: ['321'], typeId: 'typeId' });

    const qry = `
      query skills($memberIds: [String], $typeId: String, $list: Boolean) {
        skills(memberIds: $memberIds, typeId: $typeId, list: $list) {
          _id
        }
      }
    `;

    const response1 = await graphqlRequest(qry, 'skills', {
      memberIds: ['123'],
      list: false
    });

    expect(response1.length).toBe(3);

    const response2 = await graphqlRequest(qry, 'skills', {
      memberIds: ['321'],
      list: true
    });

    expect(response2.length).toBe(3);

    const response3 = await graphqlRequest(qry, 'skills', { typeId: 'typeId' });

    expect(response3.length).toBe(2);
  });

  test('skillTotalCount', async () => {
    await skillFactor({});
    await skillFactor({});
    await skillFactor({});

    const qry = `
      query skillsTotalCount($typeId: String) {
        skillsTotalCount(typeId: $typeId)
      }
    `;

    const response = await graphqlRequest(qry, 'skillsTotalCount');

    expect(response).toBe(3);
  });
});
