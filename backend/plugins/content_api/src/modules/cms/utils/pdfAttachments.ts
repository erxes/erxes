import { IAttachment, IPdfAttachment } from 'erxes-api-shared/core-types';
import {
  readFileFromStorage,
  uploadFileToStorage,
} from 'erxes-api-shared/utils';
import { execFile } from 'child_process';
import fetch from 'node-fetch';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

const DEFAULT_MAX_PAGES = 100;
const DEFAULT_MAX_BYTES = 50 * 1024 * 1024;
const DEFAULT_RENDER_DPI = 144;
const PDFINFO_TIMEOUT_MS = 30 * 1000;
const PDFTOPPM_TIMEOUT_MS = 5 * 60 * 1000;

const readPositiveIntEnv = (name: string, defaultValue: number) => {
  const rawValue = process.env[name];
  const parsed = rawValue ? Number.parseInt(rawValue, 10) : Number.NaN;

  return Number.isFinite(parsed) && parsed > 0 ? parsed : defaultValue;
};

const getMaxPages = () =>
  readPositiveIntEnv('CMS_PDF_ATTACHMENT_MAX_PAGES', DEFAULT_MAX_PAGES);

const getMaxBytes = () =>
  readPositiveIntEnv('CMS_PDF_ATTACHMENT_MAX_BYTES', DEFAULT_MAX_BYTES);

const getRenderDpi = () =>
  readPositiveIntEnv('CMS_PDF_ATTACHMENT_RENDER_DPI', DEFAULT_RENDER_DPI);

const isSameAttachment = (left?: IAttachment, right?: IAttachment) =>
  !!left?.url && !!right?.url && left.url === right.url;

const looksLikePdf = (attachment: IAttachment) => {
  const type = (attachment.type || '').toLowerCase();
  const name = (attachment.name || '').toLowerCase();
  const urlPath = (attachment.url || '').split('?')[0].toLowerCase();

  return (
    type === 'application/pdf' ||
    type.includes('pdf') ||
    name.endsWith('.pdf') ||
    urlPath.endsWith('.pdf')
  );
};

const assertPdfAttachment = (attachment: IAttachment) => {
  if (!attachment.url) {
    throw new Error('PDF attachment URL is required');
  }

  if (!looksLikePdf(attachment)) {
    throw new Error('Only PDF files can be used as PDF attachments');
  }

  const maxBytes = getMaxBytes();
  if (attachment.size && attachment.size > maxBytes) {
    throw new Error(
      `PDF attachment is too large. Maximum allowed size is ${maxBytes} bytes`,
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

  if (/^https?:\/\//i.test(attachment.url)) {
    const response = await fetch(attachment.url);

    if (!response.ok) {
      throw new Error(`Failed to download PDF attachment: ${response.status}`);
    }

    const contentLength = Number.parseInt(
      response.headers.get('content-length') || '',
      10,
    );

    if (Number.isFinite(contentLength) && contentLength > getMaxBytes()) {
      throw new Error(
        `PDF attachment is too large. Maximum allowed size is ${getMaxBytes()} bytes`,
      );
    }

    return response.buffer();
  }

  const key = getReadFileKey(attachment.url) || attachment.url;
  const buffer = await readFileFromStorage({ subdomain, key });

  if (!buffer) {
    throw new Error('PDF attachment could not be read from storage');
  }

  return buffer;
};

const ensurePdfBufferIsSafe = (buffer: Buffer) => {
  const maxBytes = getMaxBytes();

  if (buffer.length > maxBytes) {
    throw new Error(
      `PDF attachment is too large. Maximum allowed size is ${maxBytes} bytes`,
    );
  }

  if (buffer.subarray(0, 5).toString() !== '%PDF-') {
    throw new Error('Uploaded PDF attachment is not a valid PDF file');
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
        'PDF conversion requires poppler-utils to be installed in the content API runtime',
      );
    }

    const details = error?.stderr ? String(error.stderr).trim() : error.message;
    throw new Error(`Failed to process PDF attachment: ${details}`);
  }
};

const getPdfPageCount = async (pdfPath: string) => {
  const info = await runPoppler('pdfinfo', [pdfPath], PDFINFO_TIMEOUT_MS);
  const match = info.match(/^Pages:\s+(\d+)/m);

  if (!match) {
    throw new Error('Unable to determine PDF page count');
  }

  const pageCount = Number.parseInt(match[1], 10);
  const maxPages = getMaxPages();

  if (!Number.isFinite(pageCount) || pageCount < 1) {
    throw new Error('PDF attachment has no renderable pages');
  }

  if (pageCount > maxPages) {
    throw new Error(
      `PDF attachment has too many pages. Maximum allowed page count is ${maxPages}`,
    );
  }

  return pageCount;
};

const getPageNumber = (fileName: string) => {
  const match = fileName.match(/-(\d+)\.png$/);
  return match ? Number.parseInt(match[1], 10) : 0;
};

const getPdfBaseName = (pdf: IAttachment) => {
  const source = pdf.name || path.basename(pdf.url.split('?')[0]) || 'pdf';
  const baseName = source.replace(/\.pdf$/i, '').trim();

  return baseName || 'pdf';
};

const renderPdfPages = async ({
  subdomain,
  pdf,
}: {
  subdomain: string;
  pdf: IAttachment;
}): Promise<IAttachment[]> => {
  const workDir = await fs.promises.mkdtemp(
    path.join(os.tmpdir(), 'cms-pdf-attachment-'),
  );

  try {
    const pdfPath = path.join(workDir, 'source.pdf');
    const pdfBuffer = await readPdfBuffer(subdomain, pdf);
    ensurePdfBufferIsSafe(pdfBuffer);

    await fs.promises.writeFile(pdfPath, pdfBuffer);

    const pageCount = await getPdfPageCount(pdfPath);
    const outputPrefix = path.join(workDir, 'page');

    await runPoppler(
      'pdftoppm',
      ['-png', '-r', String(getRenderDpi()), pdfPath, outputPrefix],
      PDFTOPPM_TIMEOUT_MS,
    );

    const renderedFiles = (await fs.promises.readdir(workDir))
      .filter(
        (fileName) => fileName.startsWith('page-') && fileName.endsWith('.png'),
      )
      .sort((a, b) => getPageNumber(a) - getPageNumber(b));

    if (renderedFiles.length !== pageCount) {
      throw new Error('PDF page rendering did not produce all expected pages');
    }

    const baseName = getPdfBaseName(pdf);
    const pages: IAttachment[] = [];

    for (let index = 0; index < renderedFiles.length; index += 1) {
      const renderedFile = renderedFiles[index];
      const renderedPath = path.join(workDir, renderedFile);
      const pageName = `${baseName}-page-${String(index + 1).padStart(
        3,
        '0',
      )}.png`;
      const stat = await fs.promises.stat(renderedPath);
      const url = await uploadFileToStorage({
        subdomain,
        filePath: renderedPath,
        fileName: pageName,
        mimetype: 'image/png',
      });

      pages.push({
        name: pageName,
        url,
        type: 'image/png',
        size: stat.size,
      });
    }

    return pages;
  } finally {
    await fs.promises.rm(workDir, { recursive: true, force: true });
  }
};

export const preparePdfAttachmentPages = async ({
  subdomain,
  pdfAttachment,
  previousPdfAttachment,
}: {
  subdomain: string;
  pdfAttachment?: IPdfAttachment | null;
  previousPdfAttachment?: IPdfAttachment | null;
}) => {
  if (!pdfAttachment) {
    return pdfAttachment;
  }

  const pdf = pdfAttachment.pdf;

  if (!pdf?.url) {
    return { ...pdfAttachment, pages: [] };
  }

  const hasPages =
    Array.isArray(pdfAttachment.pages) && pdfAttachment.pages.length > 0;

  if (hasPages && isSameAttachment(pdf, previousPdfAttachment?.pdf)) {
    return pdfAttachment;
  }

  if (
    !hasPages &&
    isSameAttachment(pdf, previousPdfAttachment?.pdf) &&
    Array.isArray(previousPdfAttachment?.pages) &&
    previousPdfAttachment.pages.length > 0
  ) {
    return { ...pdfAttachment, pages: previousPdfAttachment.pages };
  }

  const pages = await renderPdfPages({ subdomain, pdf });

  return { ...pdfAttachment, pages };
};
