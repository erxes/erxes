import { IAttachment, IPdfAttachment } from 'erxes-api-shared/core-types';
import {
  readFileFromStorage,
  uploadFileToStorage,
} from 'erxes-api-shared/utils';
import { execFile } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { promisify } from 'util';
import { IModels } from '~/connectionResolvers';

/**
 * Product "reader" PDFs (e.g. e-books sold through POS / client portal).
 *
 * The storefront reader shows `pdfAttachment.pages` (one image per page). The
 * admin only uploads the PDF; this module renders the pages with poppler and
 * stores them. Rendering runs in the background after the product is saved so
 * long books don't hit request timeouts, and the previous pages stay live until
 * the new ones are ready.
 *
 * Mirrors content_api's cms/utils/pdfAttachments.ts (posts), with product
 * specific limits (books are long) and JPEG output (much smaller than PNG for
 * scanned/printed pages).
 */

const execFileAsync = promisify(execFile);

const DEFAULT_MAX_PAGES = 1000;
const DEFAULT_MAX_BYTES = 200 * 1024 * 1024;
const DEFAULT_RENDER_DPI = 150;
const DEFAULT_JPEG_QUALITY = 80;
const PDFINFO_TIMEOUT_MS = 60 * 1000;
const PDFTOPPM_TIMEOUT_MS = 20 * 60 * 1000;
const UPLOAD_CONCURRENCY = 4;

const readPositiveIntEnv = (name: string, defaultValue: number) => {
  const rawValue = process.env[name];
  const parsed = rawValue ? Number.parseInt(rawValue, 10) : Number.NaN;

  return Number.isFinite(parsed) && parsed > 0 ? parsed : defaultValue;
};

const getMaxPages = () =>
  readPositiveIntEnv('PRODUCT_PDF_ATTACHMENT_MAX_PAGES', DEFAULT_MAX_PAGES);
const getMaxBytes = () =>
  readPositiveIntEnv('PRODUCT_PDF_ATTACHMENT_MAX_BYTES', DEFAULT_MAX_BYTES);
const getRenderDpi = () =>
  readPositiveIntEnv('PRODUCT_PDF_ATTACHMENT_RENDER_DPI', DEFAULT_RENDER_DPI);
const getJpegQuality = () =>
  Math.min(
    100,
    readPositiveIntEnv(
      'PRODUCT_PDF_ATTACHMENT_JPEG_QUALITY',
      DEFAULT_JPEG_QUALITY,
    ),
  );

const isSameAttachment = (left?: IAttachment | null, right?: IAttachment | null) =>
  !!left?.url && !!right?.url && left.url === right.url;

const looksLikePdf = (attachment: IAttachment) => {
  const type = (attachment.type || '').toLowerCase();
  const name = (attachment.name || '').toLowerCase();
  const urlPath = (attachment.url || '').split('?')[0].toLowerCase();

  return (
    type.includes('pdf') || name.endsWith('.pdf') || urlPath.endsWith('.pdf')
  );
};

export const assertPdfAttachment = (attachment?: IAttachment | null) => {
  if (!attachment?.url) {
    throw new Error('PDF attachment URL is required');
  }

  if (!looksLikePdf(attachment)) {
    throw new Error('Only PDF files can be used as the product PDF');
  }

  const maxBytes = getMaxBytes();
  if (attachment.size && attachment.size > maxBytes) {
    throw new Error(
      `PDF is too large. Maximum allowed size is ${Math.round(
        maxBytes / 1024 / 1024,
      )} MB`,
    );
  }
};

const getReadFileKey = (value: string) => {
  try {
    const parsed = new URL(value, 'http://localhost');
    return parsed.searchParams.get('key') || undefined;
  } catch (_error) {
    return undefined;
  }
};

const readPdfBuffer = async (subdomain: string, attachment: IAttachment) => {
  assertPdfAttachment(attachment);

  if (/^https?:\/\//i.test(attachment.url) && !getReadFileKey(attachment.url)) {
    const response = await fetch(attachment.url);

    if (!response.ok) {
      throw new Error(`Failed to download PDF: ${response.status}`);
    }

    return Buffer.from(await response.arrayBuffer());
  }

  const key = getReadFileKey(attachment.url) || attachment.url;
  const buffer = await readFileFromStorage({ subdomain, key });

  if (!buffer) {
    throw new Error('PDF could not be read from storage');
  }

  return buffer as Buffer;
};

const ensurePdfBufferIsSafe = (buffer: Buffer) => {
  if (buffer.length > getMaxBytes()) {
    throw new Error('PDF is too large');
  }

  if (buffer.subarray(0, 5).toString() !== '%PDF-') {
    throw new Error('Uploaded file is not a valid PDF');
  }
};

const runPoppler = async (
  command: 'pdfinfo' | 'pdftoppm',
  args: string[],
  timeout: number,
) => {
  try {
    const { stdout } = await execFileAsync(command, args, {
      timeout,
      maxBuffer: 1024 * 1024,
    });

    return String(stdout || '');
  } catch (error: any) {
    if (error?.code === 'ENOENT') {
      throw new Error(
        'PDF conversion requires poppler-utils in the core-api runtime',
      );
    }

    const details = error?.stderr ? String(error.stderr).trim() : error.message;
    throw new Error(`Failed to process PDF: ${details}`);
  }
};

const getPdfPageCount = async (pdfPath: string) => {
  const info = await runPoppler('pdfinfo', [pdfPath], PDFINFO_TIMEOUT_MS);
  const match = info.match(/^Pages:\s+(\d+)/m);
  const pageCount = match ? Number.parseInt(match[1], 10) : Number.NaN;

  if (!Number.isFinite(pageCount) || pageCount < 1) {
    throw new Error('PDF has no renderable pages');
  }

  if (pageCount > getMaxPages()) {
    throw new Error(
      `PDF has too many pages. Maximum allowed page count is ${getMaxPages()}`,
    );
  }

  return pageCount;
};

const getPageNumber = (fileName: string) => {
  const match = fileName.match(/-(\d+)\.jpg$/);
  return match ? Number.parseInt(match[1], 10) : 0;
};

const getPdfBaseName = (pdf: IAttachment) => {
  const source = pdf.name || path.basename(pdf.url.split('?')[0]) || 'pdf';
  return source.replace(/\.pdf$/i, '').trim() || 'pdf';
};

const mapWithConcurrency = async <T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
) => {
  const results: R[] = new Array(items.length);
  let next = 0;

  const worker = async () => {
    while (next < items.length) {
      const index = next++;
      results[index] = await fn(items[index], index);
    }
  };

  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, worker),
  );

  return results;
};

export const renderProductPdfPages = async ({
  subdomain,
  pdf,
}: {
  subdomain: string;
  pdf: IAttachment;
}): Promise<IAttachment[]> => {
  const workDir = await fs.promises.mkdtemp(
    path.join(os.tmpdir(), 'product-pdf-attachment-'),
  );

  try {
    const pdfPath = path.join(workDir, 'source.pdf');
    const pdfBuffer = await readPdfBuffer(subdomain, pdf);
    ensurePdfBufferIsSafe(pdfBuffer);
    await fs.promises.writeFile(pdfPath, pdfBuffer);

    const pageCount = await getPdfPageCount(pdfPath);

    await runPoppler(
      'pdftoppm',
      [
        '-jpeg',
        '-jpegopt',
        `quality=${getJpegQuality()}`,
        '-r',
        String(getRenderDpi()),
        pdfPath,
        path.join(workDir, 'page'),
      ],
      PDFTOPPM_TIMEOUT_MS,
    );

    const renderedFiles = (await fs.promises.readdir(workDir))
      .filter((name) => name.startsWith('page-') && name.endsWith('.jpg'))
      .sort((a, b) => getPageNumber(a) - getPageNumber(b));

    if (renderedFiles.length !== pageCount) {
      throw new Error('PDF page rendering did not produce all expected pages');
    }

    const baseName = getPdfBaseName(pdf);

    return mapWithConcurrency(
      renderedFiles,
      UPLOAD_CONCURRENCY,
      async (renderedFile, index) => {
        const renderedPath = path.join(workDir, renderedFile);
        const pageName = `${baseName}-page-${String(index + 1).padStart(
          3,
          '0',
        )}.jpg`;
        const stat = await fs.promises.stat(renderedPath);
        const url = await uploadFileToStorage({
          subdomain,
          filePath: renderedPath,
          fileName: pageName,
          mimetype: 'image/jpeg',
        });

        return { name: pageName, url, type: 'image/jpeg', size: stat.size };
      },
    );
  } finally {
    await fs.promises.rm(workDir, { recursive: true, force: true });
  }
};

/**
 * Decides what to store for `pdfAttachment` on save, synchronously:
 * - no `pdfAttachment` in the input: leave the field untouched
 * - PDF removed: clear pages
 * - same PDF as before: keep the stored pages
 * - new PDF: store the PDF, keep the previous pages for now and report that
 *   rendering is needed (see `schedulePdfPagesRender`)
 */
export const resolveProductPdfAttachment = ({
  pdfAttachment,
  previousPdfAttachment,
}: {
  pdfAttachment?: IPdfAttachment | null;
  previousPdfAttachment?: IPdfAttachment | null;
}): { value?: IPdfAttachment | null; needsRender: boolean } => {
  if (pdfAttachment === undefined) {
    return { value: undefined, needsRender: false };
  }

  if (!pdfAttachment?.pdf?.url) {
    return { value: { pdf: undefined, pages: [] }, needsRender: false };
  }

  const pdf = pdfAttachment.pdf;
  assertPdfAttachment(pdf);

  if (isSameAttachment(pdf, previousPdfAttachment?.pdf)) {
    return {
      value: { pdf, pages: previousPdfAttachment?.pages || [] },
      needsRender: !previousPdfAttachment?.pages?.length,
    };
  }

  return {
    value: { pdf, pages: previousPdfAttachment?.pages || [] },
    needsRender: true,
  };
};

/**
 * Renders pages in the background and stores them only if the product still
 * points at the same PDF (a newer upload wins).
 */
export const schedulePdfPagesRender = ({
  models,
  subdomain,
  productId,
  pdf,
}: {
  models: IModels;
  subdomain: string;
  productId: string;
  pdf: IAttachment;
}) => {
  void (async () => {
    try {
      const pages = await renderProductPdfPages({ subdomain, pdf });

      await models.Products.updateOne(
        { _id: productId, 'pdfAttachment.pdf.url': pdf.url },
        { $set: { 'pdfAttachment.pages': pages } },
      );
    } catch (error: any) {
      console.error(
        `[products] PDF page rendering failed for ${productId}: ${error?.message}`,
      );
    }
  })();
};
