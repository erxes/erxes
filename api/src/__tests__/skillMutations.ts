import { graphqlRequest } from '../db/connection';
import { skillFactor, skillTypeFactor, userFactory } from '../db/factories';
import { Skills, SkillTypes, Users } from '../db/models';
import './setup.ts';

describe('skillMutations', () => {
  afterEach(async () => {
    await SkillTypes.remove({});
    await Skills.remove({});
    await Users.remove({});
  });

  test('createSkillType', async () => {
    const mutation = `
      mutation createSkillType($name: String!) {
        createSkillType(name: $name) {
          _id
        }
      }
    `;

    await graphqlRequest(mutation, 'createSkillType', { name: 'Language' });

    const skillType = await await SkillTypes.findOne({ name: 'Language' });

    if (skillType) {
      expect(skillType.name).toBe('Language');
    } else {
      fail('SkillType not found');
    }
  });

  test('updateSkillType', async () => {
    const skillType = await skillTypeFactor({});

    const mutation = `
      mutation updateSkillType($_id: String!, $name: String) {
        updateSkillType(_id: $_id, name: $name)
      }
    `;

    await graphqlRequest(mutation, 'updateSkillType', {
      _id: skillType._id,
      name: 'Coding'
    });

    const updatedSkillType = await SkillTypes.findOne({ _id: skillType._id });

    if (updatedSkillType) {
      expect(updatedSkillType.name).toBe('Coding');
    } else {
      fail('SkillType not found');
    }
  });

  test('Remove skill', async () => {
    const skillType = await skillTypeFactor({});
    const skill = await skillFactor({ typeId: skillType._id });

    const mutation = `
      mutation removeSkillType($_id: String!) {
        removeSkillType(_id: $_id)
      }
    `;

    await graphqlRequest(mutation, 'removeSkillType', { _id: skillType._id });

    expect(await Skills.findOne({ _id: skill._id })).toBe(null);
    expect(await SkillTypes.findOne({ _id: skillType._id })).toBe(null);
  });

  test('Create skill', async () => {
    const user = await userFactory({});

    const mutation = `
      mutation createSkill($name: String!, $typeId: String!, $memberIds: [String]) {
        createSkill(name: $name, typeId: $typeId, memberIds: $memberIds)
      }
    `;

    await graphqlRequest(mutation, 'createSkill', {
      name: 'French',
      typeId: 'typeId',
      memberIds: [user._id]
    });

    const newSkill = await Skills.findOne({ typeId: 'typeId' }).lean();

    expect(newSkill.name).toBe('French');
    expect(newSkill.memberIds).toEqual([user._id]);
  });

  test('Update skill', async () => {
    const skill = await skillFactor({ name: 'French' });

    const mutation = `
      mutation updateSkill($_id: String!, $typeId: String, $name: String, $memberIds: [String], $exclude: Boolean) {
        updateSkill(_id: $_id, typeId: $typeId, name: $name, memberIds: $memberIds, exclude: $exclude)
      }
    `;

    await graphqlRequest(mutation, 'updateSkill', {
      _id: skill._id,
      name: 'English'
    });

    const updatedSkill = await Skills.findOne({ _id: skill._id });

    if (updatedSkill) {
      expect(updatedSkill.name).toBe('English');
    } else {
      fail('Skill not found');
    }
  });

  test('excludeUserSkill', async () => {
    const skill = await skillFactor({ memberIds: ['123', '321'] });

    const mutation = `
      mutation excludeUserSkill($_id: String!, $memberIds: [String]!) {
        excludeUserSkill(_id: $_id, memberIds: $memberIds)
      }
    `;

    await graphqlRequest(mutation, 'excludeUserSkill', {
      _id: skill._id,
      memberIds: ['123']
    });

    const updatedSkill = await Skills.findOne({ _id: skill._id }).lean();

    if (updatedSkill) {
      expect(updatedSkill.memberIds).toEqual(['321']);
    } else {
      fail('Skill not found');
    }
  });

  test('addUserSkills', async () => {
    const skill = await skillFactor({ memberIds: ['312', '123'] });

    const mutation = `
      mutation addUserSkills($memberId: String!, $skillIds: [String]!) {
        addUserSkills(memberId: $memberId, skillIds: $skillIds)
      }
    `;

    await graphqlRequest(mutation, 'addUserSkills', {
      memberId: '444',
      skillIds: [skill._id]
    });

    const updatedSkill = await Skills.findOne({ _id: skill._id }).lean();

    expect(updatedSkill.memberIds).toEqual(['312', '123', '444']);
  });

  test('removeSkill', async () => {
    const skill = await skillFactor({});

    const mutation = `
      mutation removeSkill($_id: String!) {
        removeSkill(_id: $_id)
      }
    `;

    await graphqlRequest(mutation, 'removeSkill', { _id: skill._id });

    expect(await Skills.findOne({ _id: skill._id })).toBe(null);
  });
});
