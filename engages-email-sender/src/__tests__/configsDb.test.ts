import { Configs } from '../models';
import { configFactory } from './factories';
import './setup';

test('Test updateConfigs()', async done => {
  const doc = {
    accessKeyId: 'accessKeyId',
    secretAccessKey: 'secretAccessKey',
    region: 'region'
  };

  await Configs.updateConfigs(doc);

  const accessKeyId = await Configs.findOne({ code: doc.accessKeyId });
  const secretAccessKey = await Configs.findOne({ code: doc.secretAccessKey });
  const region = await Configs.findOne({ code: doc.region });

  expect(accessKeyId.value).toBe(doc.accessKeyId);
  expect(secretAccessKey.value).toBe(doc.secretAccessKey);
  expect(region.value).toBe(doc.region);

  done();
});

test('Test getConfigs()', async done => {
  const accessKeyId = await configFactory({ code: 'accessKeyId' });
  const secretAccessKey = await configFactory({ code: 'secretAccessKey' });
  const region = await configFactory({ code: 'region' });

  let configs = await Configs.getSESConfigs();

  expect(configs.secretAccessKey).toBe(secretAccessKey.value);
  expect(configs.accessKeyId).toBe(accessKeyId.value);
  expect(configs.region).toBe(region.value);

  await Configs.deleteMany({});

  configs = await Configs.getSESConfigs();

  expect(configs.secretAccessKey).toBe('');
  expect(configs.accessKeyId).toBe('');
  expect(configs.region).toBe('');

  done();
});

test('Test createOrUpdateConfig()', async () => {
  const config = await configFactory({ code: 'code', value: 'value' });

  const updated = await Configs.createOrUpdateConfig({
    code: config.code,
    value: 'updatedValue'
  });

  expect(updated.value).toBe('updatedValue');
});
