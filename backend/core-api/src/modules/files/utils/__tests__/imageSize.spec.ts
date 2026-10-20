import { mkdtemp, rm, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import path from 'path';
import { readImageSize } from '../imageSize';

const png = (width: number, height: number) => {
  const buffer = Buffer.alloc(33);

  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(buffer, 0);
  buffer.writeUInt32BE(13, 8);
  buffer.write('IHDR', 12, 'latin1');
  buffer.writeUInt32BE(width, 16);
  buffer.writeUInt32BE(height, 20);

  return buffer;
};

const gif = (width: number, height: number) => {
  const buffer = Buffer.alloc(13);

  buffer.write('GIF89a', 0, 'latin1');
  buffer.writeUInt16LE(width, 6);
  buffer.writeUInt16LE(height, 8);

  return buffer;
};

const jpeg = (width: number, height: number) => {
  const app1 = Buffer.alloc(4 + 300);

  app1.writeUInt16BE(0xffe1, 0);
  app1.writeUInt16BE(302, 2);

  const sof = Buffer.alloc(19);

  sof.writeUInt16BE(0xffc2, 0);
  sof.writeUInt16BE(17, 2);
  sof[4] = 8;
  sof.writeUInt16BE(height, 5);
  sof.writeUInt16BE(width, 7);

  return Buffer.concat([Buffer.from([0xff, 0xd8]), app1, Buffer.from([0xff]), sof]);
};

describe('readImageSize', () => {
  let dir: string;

  const sizeOf = async (bytes: Buffer) => {
    const file = path.join(dir, 'image');

    await writeFile(file, bytes);

    return readImageSize(file);
  };

  beforeAll(async () => {
    dir = await mkdtemp(path.join(tmpdir(), 'image-size-'));
  });

  afterAll(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('reads PNG, GIF and progressive JPEG headers', async () => {
    expect(await sizeOf(png(640, 480))).toEqual({ width: 640, height: 480 });
    expect(await sizeOf(gif(32, 16))).toEqual({ width: 32, height: 16 });
    expect(await sizeOf(jpeg(1920, 1080))).toEqual({ width: 1920, height: 1080 });
  });

  it('reports the declared size of a tiny file claiming a huge bitmap', async () => {
    expect(await sizeOf(png(30000, 30000))).toEqual({ width: 30000, height: 30000 });
  });

  it('returns null for anything it cannot read', async () => {
    expect(await sizeOf(Buffer.from('not an image'))).toBeNull();
    expect(await sizeOf(Buffer.from([0xff, 0xd8, 0xff, 0xda, 0, 2]))).toBeNull();
  });
});
