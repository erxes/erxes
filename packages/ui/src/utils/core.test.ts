import { describe, expect, it } from 'vite-plus/test';
import { readImage } from './core';

describe('readImage', () => {
  it('shows core addresses and full URLs as they are', () => {
    expect(readImage('/core/v1/files/abc/download')).toBe('/core/v1/files/abc/download');
    expect(readImage('https://cdn.example.com/a.png')).toBe('https://cdn.example.com/a.png');
    expect(readImage('data:image/png;base64,AAAA')).toBe('data:image/png;base64,AAAA');
    expect(readImage('blob:https://app.example.com/1')).toBe('blob:https://app.example.com/1');
  });

  it('reads an erxes 3.x key in place', () => {
    expect(readImage('a1B2c3photo 1.jpg')).toBe('/core/v1/read-file?key=a1B2c3photo%201.jpg');
    expect(readImage('erxes-saas/a1B2.png')).toBe('/core/v1/read-file?key=erxes-saas%2Fa1B2.png');
  });

  it('gives nothing for no file', () => {
    expect(readImage(undefined)).toBe('');
    expect(readImage(null)).toBe('');
    expect(readImage('')).toBe('');
  });
});
