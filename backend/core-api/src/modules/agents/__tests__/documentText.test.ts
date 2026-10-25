import {
  AGENTS_DOCUMENT_TEXT_MAX_CHARS,
  AgentsDocumentTextError,
  extractAgentsDocumentText,
  sniffAgentsDocumentType,
} from '@/agents/documentText';
import { AGENTS_DOCUMENT_MIME_TYPES } from '@/agents/fileValidation';
import {
  buildZip,
  docxFixture,
  odpFixture,
  odsFixture,
  odtFixture,
  pdfFixture,
  pptxFixture,
  rtfFixture,
  wordParagraph,
  xlsxFixture,
} from './fixtures/documents';

// pdf.js parses in a child process; allow for its start-up on slow runners.
jest.setTimeout(30_000);

describe('sniffAgentsDocumentType', () => {
  it('identifies every supported format from content alone', async () => {
    expect(sniffAgentsDocumentType(pdfFixture(['x']))).toBe('pdf');
    expect(sniffAgentsDocumentType(rtfFixture())).toBe('rtf');
    expect(sniffAgentsDocumentType(docxFixture(wordParagraph('x')))).toBe('docx');
    expect(sniffAgentsDocumentType(await xlsxFixture())).toBe('xlsx');
    expect(sniffAgentsDocumentType(pptxFixture(['x']))).toBe('pptx');
    expect(sniffAgentsDocumentType(odtFixture())).toBe('odt');
    expect(sniffAgentsDocumentType(odsFixture())).toBe('ods');
    expect(sniffAgentsDocumentType(odpFixture())).toBe('odp');
  });

  it('ignores other archives and plain bytes', () => {
    expect(sniffAgentsDocumentType(buildZip({ 'notes.txt': 'x' }))).toBeUndefined();
    expect(
      sniffAgentsDocumentType(
        buildZip(
          { mimetype: 'application/vnd.oasis.opendocument.text-template' },
          { stored: true },
        ),
      ),
    ).toBeUndefined();
    expect(sniffAgentsDocumentType(Buffer.from('name,code\nTea,1'))).toBeUndefined();
  });
});

describe('extractAgentsDocumentText', () => {
  it('reads Word paragraphs and tables', async () => {
    const body =
      wordParagraph('Quarterly report &amp; plan') +
      '<w:tbl><w:tr><w:tc><w:p><w:r><w:t>Name</w:t></w:r></w:p></w:tc><w:tc><w:p><w:r><w:t>Total</w:t></w:r></w:p></w:tc></w:tr>' +
      '<w:tr><w:tc><w:p><w:r><w:t>Tea</w:t></w:r></w:p></w:tc><w:tc><w:p><w:r><w:t>42</w:t></w:r></w:p></w:tc></w:tr></w:tbl>';
    const result = await extractAgentsDocumentText(docxFixture(body), 'docx');
    expect(result.mimeType).toBe(AGENTS_DOCUMENT_MIME_TYPES.docx);
    expect(result.text).toContain('Quarterly report & plan');
    expect(result.text).toMatch(/Name\s*\|\s*Total/);
    expect(result.text).toMatch(/Tea\s*\|\s*42/);
  });

  it('reads every Excel sheet as CSV with formatted dates and formula results', async () => {
    const result = await extractAgentsDocumentText(await xlsxFixture(), 'xlsx');
    expect(result).toEqual({
      mimeType: AGENTS_DOCUMENT_MIME_TYPES.xlsx,
      text: '# Sheet: Deals & Co\nName,Amount,Closed,Won\n"Acme, Inc",1250.5,2026-03-14,TRUE\nFormula,2501,,FALSE\n\n# Sheet: Empty',
    });
  });

  it.each([
    ['pptx', () => pptxFixture(['Launch plan', 'Budget: 40k']), 'Launch plan\nBudget: 40k'],
    ['odt', odtFixture, 'Contract\nRenewal on 1 May.'],
    ['ods', odsFixture, 'Revenue,42'],
    ['odp', odpFixture, 'Roadmap'],
    ['rtf', rtfFixture, 'Meeting notes\nShip on Friday.'],
  ] as const)('reads %s text', async (type, make, text) => {
    await expect(extractAgentsDocumentText(make(), type)).resolves.toEqual({
      mimeType: AGENTS_DOCUMENT_MIME_TYPES[type],
      text,
    });
  });

  it('reads PDF text in an isolated parser process', async () => {
    const result = await extractAgentsDocumentText(
      pdfFixture(['Quarterly brief', 'Revenue grew 12% (net)']),
      'pdf',
    );
    expect(result).toEqual({
      mimeType: 'application/pdf',
      text: 'Quarterly brief\nRevenue grew 12% (net)',
    });
  });

  it('rejects corrupt documents with an actionable error', async () => {
    const docx = docxFixture(wordParagraph('x'));
    await expect(
      extractAgentsDocumentText(docx.subarray(0, 60), 'docx'),
    ).rejects.toThrow(
      new AgentsDocumentTextError(
        'The document could not be read. Upload a valid, unprotected file.',
      ),
    );
    await expect(
      extractAgentsDocumentText(Buffer.from('%PDF-1.4\nnot really'), 'pdf'),
    ).rejects.toThrow(AgentsDocumentTextError);
  });

  it('rejects archives that inflate past the decompression limit', async () => {
    const bomb = docxFixture(wordParagraph('a'.repeat(70 * 1024 * 1024)));
    expect(bomb.length).toBeLessThan(1024 * 1024);
    await expect(extractAgentsDocumentText(bomb, 'docx')).rejects.toThrow(
      AgentsDocumentTextError,
    );
  });

  it('caps long documents with a truncation notice', async () => {
    const body = Array.from({ length: 200 }, () =>
      wordParagraph('a'.repeat(1000)),
    ).join('');
    const { text } = await extractAgentsDocumentText(docxFixture(body), 'docx');
    expect(text.length).toBeLessThan(AGENTS_DOCUMENT_TEXT_MAX_CHARS + 200);
    expect(text).toMatch(/\[Truncated: .*\]$/);
  });

  it('gives up when parsing exceeds the time limit', async () => {
    await expect(
      extractAgentsDocumentText(pdfFixture(['slow']), 'pdf', { timeoutMs: 1 }),
    ).rejects.toThrow('Reading the document took too long.');
  });
});
