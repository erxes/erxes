import { ASSISTANT_DOCUMENT_FORMATS } from '@erxes/core-db/enums';
import { OfficeParser, type OfficeParserConfig, OfficeWarningType } from 'officeparser';
import { parentPort, workerData } from 'node:worker_threads';
import { z } from 'zod';

const DocumentJob = z.object({
  bytes: z.instanceof(Uint8Array),
  format: z.enum(ASSISTANT_DOCUMENT_FORMATS),
  maxChars: z.int().min(1),
});

export type DocumentJob = z.infer<typeof DocumentJob>;

export type DocumentFormat = DocumentJob['format'];

type DocumentResult =
  | { ok: true; text: string; truncated: boolean; scanned: boolean }
  | { ok: false; code: string };

const LIMITS = {
  maxUncompressedBytes: 32 * 1024 * 1024,
  maxZipEntries: 2000,
  maxTableCells: 200_000,
  maxXmlElements: 250_000,
};

const configFor = (format: DocumentFormat): OfficeParserConfig => ({
  fileType: format,
  allowRemoteAssets: false,
  ocr: false,
  extractAttachments: false,
  includeRawContent: false,
  ignoreComments: true,
  ignoreNotes: true,
  decompressionLimits: LIMITS,
  pdfParserConfig: { separateProcess: false },
});

const codeOf = (error: unknown) => {
  if (typeof error !== 'object' || error === null || !('officeIssue' in error)) return 'UNREADABLE';

  const issue = error.officeIssue;

  return typeof issue === 'object' &&
    issue !== null &&
    'code' in issue &&
    typeof issue.code === 'string'
    ? issue.code
    : 'UNREADABLE';
};

const parseDocument = async ({ bytes, format, maxChars }: DocumentJob): Promise<DocumentResult> => {
  try {
    const ast = await OfficeParser.parseOffice(Buffer.from(bytes), configFor(format));
    const { value } = await ast.to(format === 'xlsx' ? 'csv' : 'text');
    const text = typeof value === 'string' ? value.trim() : '';

    return {
      ok: true,
      text: text.slice(0, maxChars),
      truncated: text.length > maxChars,
      scanned:
        !text &&
        ast.warnings.some((warning) => warning.code === OfficeWarningType.PDF_NO_TEXT_EXTRACTED),
    };
  } catch (error) {
    return { ok: false, code: codeOf(error) };
  }
};

void parseDocument(DocumentJob.parse(workerData)).then((result) =>
  parentPort?.postMessage(result, []),
);
