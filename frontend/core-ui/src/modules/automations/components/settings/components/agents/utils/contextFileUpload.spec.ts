import { checkContextFiles, formatBytes } from './contextFileUpload';

const file = (name: string, size: number) =>
  ({ name, size } as unknown as File);

const limits = {
  existingCount: 0,
  existingBytes: 0,
  maxFiles: 2,
  maxSingleFileBytes: 1000,
  maxTotalContextBytes: 1500,
};

describe('checkContextFiles', () => {
  it('accepts markdown and text within the limits', () => {
    const files = [file('a.md', 500), file('b.txt', 500)];

    expect(checkContextFiles(files, limits)).toEqual({ files });
  });

  it('refuses the whole selection on the first bad file', () => {
    expect(
      checkContextFiles([file('a.md', 10), file('b.pdf', 10)], limits),
    ).toEqual({
      rejected: {
        titleKey: 'settings-dropzone-unsupported-format',
        descriptionKey: 'settings-dropzone-unsupported-format-description',
        values: { name: 'b.pdf' },
      },
    });
  });

  it('refuses a file over the single-file size', () => {
    const result = checkContextFiles([file('a.md', 2000)], limits);

    expect('rejected' in result && result.rejected.titleKey).toBe(
      'settings-dropzone-file-too-large',
    );
  });

  it('counts files already there toward the limit', () => {
    const result = checkContextFiles([file('a.md', 10)], {
      ...limits,
      existingCount: 2,
    });

    expect('rejected' in result && result.rejected.titleKey).toBe(
      'settings-dropzone-too-many-files',
    );
  });

  it('refuses what would push the total over', () => {
    const result = checkContextFiles(
      [file('a.md', 900), file('b.md', 900)],
      limits,
    );

    expect('rejected' in result && result.rejected.titleKey).toBe(
      'settings-dropzone-combined-too-large',
    );
  });

  it('formats sizes', () => {
    expect(formatBytes(999)).toBe('999 B');
    expect(formatBytes(1500)).toBe('2 KB');
  });
});
