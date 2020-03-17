import { Configs } from '../models';
import { configFactory } from './factories';
import './setup';

test('updateConfig', async done => {
  await Configs.updateConfigs({
    accessKeyId: 'accessKeyId',
    secretAccessKey: 'secretAccessKey',
    region: 'region',
  });

  const accessKeyId = await Configs.findOne({ code: 'accessKeyId' });

  const secretAccessKey = await Configs.findOne({ code: 'secretAccessKey' });

  const region = await Configs.findOne({ code: 'region' });

  expect(accessKeyId).toBeDefined();
  expect(accessKeyId.value).toBe('accessKeyId');
  expect(secretAccessKey).toBeDefined();
  expect(secretAccessKey.value).toBe('secretAccessKey');
  expect(region).toBeDefined();
  expect(region.value).toBe('region');

  done();
});

test('getConfigs', async done => {
  const accessKeyId = await configFactory({
    code: 'accessKeyId',
  });

  const secretAccessKey = await configFactory({
    code: 'secretAccessKey',
  });

  const region = await configFactory({
    code: 'region',
  });

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
