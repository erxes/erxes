import { test } from 'node:test';
import { deepStrictEqual, throws } from 'node:assert';
import { parseViberAccountInfo } from '../account';

test('return only the Viber account id and name', () => {
  const val = {
    status: 0,
    id: 'pa:test',
    name: 'Support',
    subscribers_count: 42,
  };
  const expected = { id: 'pa:test', name: 'Support' };

  deepStrictEqual(parseViberAccountInfo(val), expected);
});

test('rejects an unsuccessful Viber account response', () => {
  const val = {
    status: 1,
    id: 'pa:test',
    name: 'Support',
  };

  throws(() => parseViberAccountInfo(val), {
    message: 'Invalid Viber account info response',
  });
});

test('rejects a null account response', () => {
  throws(() => parseViberAccountInfo(null), {
    message: 'Invalid Viber account info response',
  });
});

test('rejects an array account response', () => {
  throws(() => parseViberAccountInfo([]), {
    message: 'Invalid Viber account info response',
  });
});
