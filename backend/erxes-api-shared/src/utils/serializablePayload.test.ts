import { toSerializablePayload } from './serializablePayload';

describe('toSerializablePayload', () => {
  test('keeps an object that is referenced twice', () => {
    const scheduleDate = { type: 'pre', dateTime: '2026-09-21T04:00:00.000Z' };

    // The shape a change log sends: the diff names the same subdocument the
    // document it came from already carries.
    const result = toSerializablePayload({
      currentDocument: { _id: 'x', scheduleDate },
      updateDescription: { added: { scheduleDate } },
    });

    expect(result.updateDescription.added.scheduleDate).toEqual(scheduleDate);
    expect(result.currentDocument.scheduleDate).toEqual(scheduleDate);
  });

  test('keeps a whole document sent under two keys', () => {
    const currentDocument = { _id: 'x', title: 'Campaign' };

    const result = toSerializablePayload({
      currentDocument,
      fullDocument: currentDocument,
    });

    expect(result.fullDocument).toEqual(currentDocument);
  });

  test('breaks a value that contains itself', () => {
    const parent: Record<string, unknown> = { name: 'parent' };
    parent.self = parent;

    expect(toSerializablePayload(parent)).toEqual({ name: 'parent' });
  });

  test('breaks a cycle through an array', () => {
    const node: Record<string, unknown> = { name: 'node' };
    node.children = [{ parent: node }];

    expect(toSerializablePayload(node)).toEqual({
      name: 'node',
      children: [{}],
    });
  });

  test('keeps siblings that are the same array', () => {
    const tags = ['a', 'b'];

    const result = toSerializablePayload({ before: tags, after: tags });

    expect(result).toEqual({ before: ['a', 'b'], after: ['a', 'b'] });
  });

  test('leaves undefined alone', () => {
    expect(toSerializablePayload(undefined)).toBeUndefined();
  });

  test('turns dates into strings, as the queue carries them', () => {
    const at = new Date('2026-09-21T04:00:00.000Z');

    expect(toSerializablePayload({ at })).toEqual({
      at: '2026-09-21T04:00:00.000Z',
    });
  });
});
