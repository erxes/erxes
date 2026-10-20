import { execFile, spawn } from 'child_process';
import { mkdtemp, rm, writeFile } from 'fs/promises';
import { Jimp } from 'jimp';
import { tmpdir } from 'os';
import path from 'path';
import { promisify } from 'util';
import {
  FILES_DERIVE_PDF_MAX,
  FILES_DERIVE_TIMEOUT_MS,
  FILES_THUMBNAIL_IMAGE_MAX,
  FILES_THUMBNAIL_MAX_PIXELS,
  FILES_THUMBNAIL_SIZE,
} from '@/files/constants';
import { readImageSize } from '@/files/utils/imageSize';

const execFileAsync = promisify(execFile);

export type TPreviewKind = 'image' | 'pdf';

export type TBuiltPreview = {
  thumbnailPath?: string;
  viewerPath?: string;
};

// Jimp's default build can't decode WebP.
const THUMBNAIL_IMAGE = /^image\/(png|jpeg|gif)$/;

export const getPreviewKind = (mimeType: string, size: number): TPreviewKind | null => {
  if (THUMBNAIL_IMAGE.test(mimeType) && size <= FILES_THUMBNAIL_IMAGE_MAX) {
    return 'image';
  }

  if (mimeType === 'application/pdf' && size <= FILES_DERIVE_PDF_MAX) {
    return 'pdf';
  }

  return null;
};

export const withPreviewWorkspace = async <T>(fn: (dir: string) => Promise<T>) => {
  const dir = await mkdtemp(path.join(tmpdir(), 'files-preview-'));

  try {
    return await fn(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
};

const imageThumbnail = async (sourcePath: string, outPath: string) => {
  const size = await readImageSize(sourcePath);

  if (!size || size.width * size.height > FILES_THUMBNAIL_MAX_PIXELS) {
    return undefined;
  }

  const image = await Jimp.read(sourcePath);
  const { width, height } = image.bitmap;

  if (width > FILES_THUMBNAIL_SIZE || height > FILES_THUMBNAIL_SIZE) {
    image.scaleToFit({ w: FILES_THUMBNAIL_SIZE, h: FILES_THUMBNAIL_SIZE });
  }

  await writeFile(outPath, await image.getBuffer('image/png'));

  return outPath;
};

const hasObjectStreams = (sourcePath: string) =>
  new Promise<boolean>((resolve, reject) => {
    const child = spawn('qpdf', ['--show-xref', sourcePath], {
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    const timer = setTimeout(() => child.kill(), FILES_DERIVE_TIMEOUT_MS);
    let tail = '';
    let found = false;

    child.stdout.on('data', (chunk: Buffer) => {
      const text = tail + chunk.toString('latin1');

      if (text.includes(': compressed;')) {
        found = true;
        child.kill();
      }

      tail = text.slice(-16);
    });

    child.on('error', reject);
    child.on('close', (code) => {
      clearTimeout(timer);

      if (found) {
        return resolve(true);
      }

      // qpdf exits 3 on success with warnings.
      if (code === 0 || code === 3) {
        return resolve(false);
      }

      reject(new Error(`qpdf --show-xref exited with ${code}`));
    });
  });

// Object streams only; --linearize measured slower in pdf.js.
const pdfViewerCopy = async (sourcePath: string, dir: string) => {
  if (await hasObjectStreams(sourcePath)) {
    return undefined;
  }

  const outPath = path.join(dir, 'viewer.pdf');

  try {
    await execFileAsync('qpdf', ['--object-streams=generate', sourcePath, outPath], {
      timeout: FILES_DERIVE_TIMEOUT_MS,
    });
  } catch (e) {
    if ((e as { code?: number }).code !== 3) {
      throw e;
    }
  }

  return outPath;
};

export const buildPreview = async (
  kind: TPreviewKind,
  sourcePath: string,
  dir: string,
): Promise<TBuiltPreview> =>
  kind === 'image'
    ? { thumbnailPath: await imageThumbnail(sourcePath, path.join(dir, 'thumb.png')) }
    : { viewerPath: await pdfViewerCopy(sourcePath, dir) };
