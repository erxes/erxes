import { responseTemplateFactory } from '../db/factories';
import { ResponseTemplates } from '../db/models';

import './setup.ts';

describe('Response template db', () => {
  let _responseTemplate;

  beforeEach(async () => {
    // Creating test data
    _responseTemplate = await responseTemplateFactory({});
  });

  afterEach(async () => {
    // Clearing test data
    await ResponseTemplates.deleteMany({});
  });

  test('Get response template', async () => {
    try {
      await ResponseTemplates.getResponseTemplate('fakeId');
    } catch (e) {
      expect(e.message).toBe('Response template not found');
    }

    const response = await ResponseTemplates.getResponseTemplate(
      _responseTemplate._id
    );

    expect(response).toBeDefined();
  });

  test('Create response template', async () => {
    const responseTemplateObj = await ResponseTemplates.create({
      name: _responseTemplate.name,
      content: _responseTemplate.content,
      brandId: _responseTemplate.brandId,
      files: _responseTemplate.files
    });

    if (!responseTemplateObj || !responseTemplateObj.files) {
      throw new Error('Response template not found');
    }

    expect(responseTemplateObj).toBeDefined();
    expect(responseTemplateObj.name).toBe(_responseTemplate.name);
    expect(responseTemplateObj.content).toBe(_responseTemplate.content);
    expect(responseTemplateObj.brandId).toBe(_responseTemplate.brandId);
    expect(responseTemplateObj.files[0]).toBe(_responseTemplate.files[0]);
  });

  test('Update response template', async () => {
    const responseTemplateObj = await ResponseTemplates.updateResponseTemplate(
      _responseTemplate.id,
      {
        name: _responseTemplate.name,
        content: _responseTemplate.content,
        brandId: _responseTemplate.brandId,
        files: _responseTemplate.files
      }
    );

    if (!responseTemplateObj || !responseTemplateObj.files) {
      throw new Error('Response template not found');
    }

    expect(responseTemplateObj.id).toBe(_responseTemplate.id);
    expect(responseTemplateObj.name).toBe(_responseTemplate.name);
    expect(responseTemplateObj.content).toBe(_responseTemplate.content);
    expect(responseTemplateObj.brandId).toBe(_responseTemplate.brandId);
    expect(responseTemplateObj.files[0]).toBe(_responseTemplate.files[0]);
  });

  test('Delete response template', async () => {
    await ResponseTemplates.removeResponseTemplate(_responseTemplate.id);
    expect(
      await ResponseTemplates.findOne({
        _id: _responseTemplate.id
      }).countDocuments()
    ).toBe(0);

    try {
      await ResponseTemplates.removeResponseTemplate('test');
    } catch (e) {
      expect(e.message).toBe('Response template not found with id test');
    }
  });
});
