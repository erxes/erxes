import { stripDataExtensionsFromUpdate } from './namespaceGuard';

describe('stripDataExtensionsFromUpdate', () => {
  it('drops namespace paths from plain and operator updates', () => {
    expect(
      stripDataExtensionsFromUpdate({
        name: 'Acme',
        dataExtensions: {},
        'dataExtensions.score': 1,
        $set: { status: 'active', 'dataExtensions.tier': 'gold' },
        $unset: { dataExtensions: '' },
        $inc: { 'dataExtensions.count': 1, score: 1 },
      }),
    ).toEqual({
      name: 'Acme',
      $set: { status: 'active' },
      $inc: { score: 1 },
    });
  });

  it('drops renames into or out of the namespace', () => {
    expect(
      stripDataExtensionsFromUpdate({
        $rename: { legacy: 'dataExtensions.legacy', a: 'b' },
      }),
    ).toEqual({ $rename: { a: 'b' } });
  });

  it('keeps unrelated paths that only share a prefix', () => {
    expect(
      stripDataExtensionsFromUpdate({ $set: { dataExtensionsNote: 'x' } }),
    ).toEqual({ $set: { dataExtensionsNote: 'x' } });
  });

  it('rejects pipelines that touch or rebuild the document', () => {
    expect(() =>
      stripDataExtensionsFromUpdate([{ $set: { dataExtensions: '$$REMOVE' } }]),
    ).toThrow('Update pipelines');
    expect(() =>
      stripDataExtensionsFromUpdate([{ $project: { name: 1 } }]),
    ).toThrow('Update pipelines');
    expect(() =>
      stripDataExtensionsFromUpdate([{ $replaceWith: { name: 'A' } }]),
    ).toThrow('Update pipelines');
  });

  it('allows pipelines that only set or unset other paths', () => {
    const pipeline = [{ $set: { a: 1 } }, { $unset: 'b' }];

    expect(stripDataExtensionsFromUpdate(pipeline)).toEqual(pipeline);
  });
});
