import {
  AGENTS_DOCUMENT_TEXT_MAX_CHARS,
  AgentsDocumentTextError,
  DOCX_MIME_TYPE,
  XLSX_MIME_TYPE,
  docxXmlToText,
  extractOfficeDocumentText,
} from '@/agents/documentText';
import { buildZip } from './fixtures/officeZip';

const W = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"';
const docx = (body: string) =>
  buildZip({
    '[Content_Types].xml': '<Types/>',
    'word/document.xml': `<?xml version="1.0"?><w:document ${W}><w:body>${body}</w:body></w:document>`,
  });

describe('docxXmlToText', () => {
  it('keeps paragraphs, tabs, breaks and table cells and skips deletions', () => {
    const xml = `<w:document ${W}><w:body>
      <w:p><w:r><w:t>Quarterly</w:t></w:r><w:r><w:t xml:space="preserve"> report &amp; plan</w:t></w:r></w:p>
      <w:p><w:r><w:t>Line</w:t><w:br/><w:t>two</w:t><w:tab/><w:t>tabbed</w:t></w:r></w:p>
      <w:p><w:r><w:delText>removed</w:delText><w:instrText>PAGE</w:instrText></w:r></w:p>
      <w:tbl><w:tr><w:tc><w:p><w:r><w:t>Name</w:t></w:r></w:p></w:tc><w:tc><w:p><w:r><w:t>Total</w:t></w:r></w:p></w:tc></w:tr>
      <w:tr><w:tc><w:p><w:r><w:t>Tea</w:t></w:r></w:p></w:tc><w:tc><w:p><w:r><w:t>&#8364;42</w:t></w:r></w:p></w:tc></w:tr></w:tbl>
    </w:body></w:document>`;
    expect(docxXmlToText(xml)).toBe(
      'Quarterly report & plan\nLine\ntwo\ttabbed\n\nName\tTotal\nTea\t€42',
    );
  });
});

describe('extractOfficeDocumentText', () => {
  it('reads DOCX text from deflated and stored archives', () => {
    const body = '<w:p><w:r><w:t>Hello agent</w:t></w:r></w:p>';
    expect(extractOfficeDocumentText(docx(body))).toEqual({
      mimeType: DOCX_MIME_TYPE,
      text: 'Hello agent',
    });
    const stored = buildZip(
      { 'word/document.xml': `<w:document ${W}><w:body>${body}</w:body></w:document>` },
      { stored: true },
    );
    expect(extractOfficeDocumentText(stored)?.text).toBe('Hello agent');
  });

  it('reads every XLSX sheet as CSV with shared, inline and boolean cells', () => {
    const xlsx = buildZip({
      'xl/workbook.xml':
        '<workbook xmlns:r="r"><sheets><sheet name="Deals &amp; Co" sheetId="1" r:id="rId1"/><sheet name="Empty" sheetId="2" r:id="rId2"/></sheets></workbook>',
      'xl/_rels/workbook.xml.rels':
        '<Relationships><Relationship Id="rId1" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Target="/xl/worksheets/sheet2.xml"/></Relationships>',
      'xl/sharedStrings.xml':
        '<sst><si><t>Name</t></si><si><t>Amount</t></si><si><r><t>Acme,</t></r><r><t xml:space="preserve"> Inc</t></r><rPh><t>ignored</t></rPh></si></sst>',
      'xl/worksheets/sheet1.xml':
        '<worksheet><sheetData>' +
        '<row r="1"><c r="A1" t="s"><v>0</v></c><c r="B1" t="s"><v>1</v></c></row>' +
        '<row r="2"><c r="A2" t="s"><v>2</v></c><c r="C2"><v>1250.5</v></c></row>' +
        '<row r="3"><c r="A3" t="inlineStr"><is><t>Say "hi"</t></is></c><c r="B3" t="b"><v>1</v></c></row>' +
        '<row r="4"/>' +
        '</sheetData></worksheet>',
      'xl/worksheets/sheet2.xml': '<worksheet><sheetData/></worksheet>',
    });
    expect(extractOfficeDocumentText(xlsx)).toEqual({
      mimeType: XLSX_MIME_TYPE,
      text:
        '## Sheet: Deals & Co\nName,Amount\n"Acme, Inc",,1250.5\n"Say ""hi""",TRUE\n\n## Sheet: Empty\n(empty)',
    });
  });

  it('ignores other archives and non-archives', () => {
    expect(extractOfficeDocumentText(buildZip({ 'a.txt': 'x' }))).toBeUndefined();
    expect(extractOfficeDocumentText(Buffer.from('plain text'))).toBeUndefined();
  });

  it('rejects corrupt archives', () => {
    const archive = docx('<w:p><w:r><w:t>x</w:t></w:r></w:p>');
    expect(() => extractOfficeDocumentText(archive.subarray(0, 40))).toThrow(
      AgentsDocumentTextError,
    );
  });

  it('caps extracted text', () => {
    const run = `<w:p><w:r><w:t>${'a'.repeat(1000)}</w:t></w:r></w:p>`;
    const text = extractOfficeDocumentText(docx(run.repeat(200)))?.text ?? '';
    expect(text.length).toBeLessThan(AGENTS_DOCUMENT_TEXT_MAX_CHARS + 200);
    expect(text).toMatch(/\[Truncated: .*\]$/);
  });
});
