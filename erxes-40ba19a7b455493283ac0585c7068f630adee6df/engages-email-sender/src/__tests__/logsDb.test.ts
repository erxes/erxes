import { Logs } from '../models';
import { LOG_MESSAGE_TYPES } from '../models/Logs';
import { randomElementOfArray } from './factories';
import './setup';

test('Test createLog()', async () => {
  const type = randomElementOfArray(LOG_MESSAGE_TYPES);
  const log = await Logs.createLog('messageId', type, 'Message');

  expect(log.engageMessageId).toBe('messageId');
  expect(log.type).toBe(type);
  expect(log.message).toBe('Message');
});
