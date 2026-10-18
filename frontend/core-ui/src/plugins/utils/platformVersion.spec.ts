import { satisfiesPlatformRange } from '~/plugins/utils/platformVersion';

describe('satisfiesPlatformRange', () => {
  it.each([
    ['3.2.25', '~3.2', true],
    ['3.2.0', '~3.2', true],
    ['3.3.0', '~3.2', false],
    ['3.2.25', '~3.2.26', false],
    ['3.2.26', '~3.2.25', true],
    ['3.9.1', '^3.2.0', true],
    ['4.0.0', '^3.2.0', false],
    ['3.2.25', '3.2', true],
    ['3.2.25', '3.2.x', true],
    ['3.2.25', '3.2.25', true],
    ['3.2.24', '3.2.25', false],
    ['3.2.25', '>=3.2.25 <3.4', true],
    ['3.4.0', '>=3.2.25 <3.4', false],
    ['3.1.0', '~3.1 || ~3.2', true],
    ['3.0.9', '~3.1 || ~3.2', false],
    ['3.2.25', '*', true],
  ])('%s in %s → %s', (version, range, expected) => {
    expect(satisfiesPlatformRange(version, range)).toBe(expected);
  });

  it('treats a prerelease of the running platform as its release line', () => {
    expect(satisfiesPlatformRange('3.2.25-next.4', '~3.2')).toBe(true);
    expect(satisfiesPlatformRange('3.2.25-next.4', '>=3.2.25')).toBe(true);
    expect(satisfiesPlatformRange('3.3.0-next.1', '~3.2')).toBe(false);
  });

  it('returns null when it cannot tell', () => {
    expect(satisfiesPlatformRange('unknown', '~3.2')).toBeNull();
    expect(satisfiesPlatformRange('3.2.25', '>=banana')).toBeNull();
  });
});
