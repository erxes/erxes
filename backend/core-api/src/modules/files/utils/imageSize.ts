import { open } from 'fs/promises';

export type TImageSize = { width: number; height: number };

const JPEG_MAX_SEGMENTS = 256;

const isJpegFrame = (marker: number) =>
  marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker);

// Reads dimensions from the header only, so the bitmap is never decoded.
export const readImageSize = async (filePath: string): Promise<TImageSize | null> => {
  const file = await open(filePath, 'r');

  try {
    const read = async (position: number, length: number) => {
      const buffer = Buffer.alloc(length);
      const { bytesRead } = await file.read(buffer, 0, length, position);

      return buffer.subarray(0, bytesRead);
    };

    const head = await read(0, 26);

    if (head.length >= 24 && head.readUInt32BE(0) === 0x89504e47) {
      return { width: head.readUInt32BE(16), height: head.readUInt32BE(20) };
    }

    if (head.length >= 10 && head.toString('latin1', 0, 3) === 'GIF') {
      return { width: head.readUInt16LE(6), height: head.readUInt16LE(8) };
    }

    if (head.length >= 4 && head[0] === 0xff && head[1] === 0xd8) {
      let position = 2;

      for (let i = 0; i < JPEG_MAX_SEGMENTS; i++) {
        const segment = await read(position, 9);

        if (segment.length < 4 || segment[0] !== 0xff) {
          return null;
        }

        const marker = segment[1];

        if (marker === 0xff) {
          position += 1;
          continue;
        }

        if (isJpegFrame(marker)) {
          return segment.length < 9
            ? null
            : { width: segment.readUInt16BE(7), height: segment.readUInt16BE(5) };
        }

        if (marker === 0xda || marker === 0xd9) {
          return null;
        }

        position += 2 + segment.readUInt16BE(2);
      }
    }

    return null;
  } finally {
    await file.close();
  }
};
