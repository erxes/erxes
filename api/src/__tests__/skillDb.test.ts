import { skillFactor, skillTypeFactor, userFactory } from '../db/factories';
import { Skills, SkillTypes, Users } from '../db/models';
import './setup.ts';

describe('Test SkillType model', () => {
  afterEach(async () => {
    await SkillTypes.remove({});
    await Skills.remove({});
  });

  test('Create skill type', async () => {
    const createdSkillType = await SkillTypes.createSkillType('Branding');

    expect(createdSkillType).toBeDefined();
    expect(createdSkillType.name).toBe('Branding');
  });

  test('Update skill type', async () => {
    const skillType = await skillTypeFactor({ name: 'Language' });

    await SkillTypes.updateSkillType(skillType._id, 'Coding');

    const updatedSkillType = await SkillTypes.findOne({ _id: skillType._id });

    if (updatedSkillType) {
      expect(updatedSkillType.name).toBe('Coding');
    }
  });

  test('Remove skill type', async () => {
    const skillType = await skillTypeFactor({ name: 'Language' });
    const skill = await skillFactor({ name: 'French', typeId: skillType._id });

    await SkillTypes.removeSkillType(skillType._id);

    expect(await Skills.findOne({ _id: skill._id })).toBe(null);
    expect(await SkillTypes.findOne({ _id: skillType._id })).toBe(null);
  });
});

describe('Test Skill model', () => {
  afterEach(async () => {
    await Skills.remove({});
    await SkillTypes.remove({});
    await Users.remove({});
  });

  test('Create a skill', async () => {
    await Skills.createSkill({
      name: 'French',
      typeId: 'typeId',
      memberIds: ['alksdjlkaj']
    });

    const skill = await Skills.findOne({ typeId: 'typeId' }).lean();

    if (skill) {
      expect(skill.name).toBe('French');
      expect(skill.typeId).toBe('typeId');
      expect(skill.memberIds).toEqual(['alksdjlkaj']);
    } else {
      fail('Skill not found');
    }
  });

  test('Exclude user from a skill', async () => {
    const user = await userFactory();

    const skill = await skillFactor({
      name: 'Marketing',
      memberIds: [user._id, '123']
    });

    await Skills.excludeUserSkill(skill._id, [user._id]);

    const updatedSkill = await Skills.findOne({ _id: skill._id }).lean();

    if (updatedSkill) {
      expect(updatedSkill.memberIds).toEqual(['123']);
    } else {
      fail('Skill not found');
    }
  });

  test('Update skill', async () => {
    const skill = await skillFactor({ name: 'Korean' });

    await Skills.updateSkill({
      _id: skill._id,
      name: 'French',
      memberIds: ['123'],
      typeId: '123'
    });

    const updatedSkill = await Skills.findOne({ _id: skill._id });

    if (updatedSkill) {
      expect(updatedSkill.name).toBe('French');
    } else {
      fail('Skill not found');
    }
  });

  test('Remove skill', async () => {
    const skill = await skillFactor({ name: 'Korean' });

    const id = await Skills.removeSkill(skill._id);

    expect(id).toBe(skill._id);

    expect(await Skills.findOne({ _id: skill._id })).toBe(null);
  });
});
