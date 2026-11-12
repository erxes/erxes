import { describe, expect, it } from 'vite-plus/test';
import { parseFilesAsAttachments } from './types';

const photo = {
  url: 'https://files.example.com/a/photo.JPG?v=2',
  name: 'photo.JPG?v=2',
  size: 0,
  type: 'image/jpeg',
};

describe('parseFilesAsAttachments', () => {
  it('reads a JSON list, a JSON object, a plain address and a list', () => {
    expect(parseFilesAsAttachments(JSON.stringify([photo.url]))).toEqual([photo]);
    expect(parseFilesAsAttachments(JSON.stringify({ url: photo.url }))).toEqual([photo]);
    expect(parseFilesAsAttachments(photo.url)).toEqual([photo]);
    expect(parseFilesAsAttachments([photo.url])).toEqual([photo]);
    expect(parseFilesAsAttachments({ url: photo.url })).toEqual([photo]);
  });

  it('types unknown extensions as binary and ignores empty or foreign values', () => {
    expect(parseFilesAsAttachments('/files/notes')[0]?.type).toBe('application/octet-stream');
    expect(parseFilesAsAttachments('')).toEqual([]);
    expect(parseFilesAsAttachments(null)).toEqual([]);
    expect(parseFilesAsAttachments(42)).toEqual([]);
    expect(parseFilesAsAttachments('{"name":"x"}')).toEqual([]);
  });
});
