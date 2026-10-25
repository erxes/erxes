import { crc32, deflateRawSync } from 'zlib';

/**
 * Small, readable document fixtures for every format `readFile` extracts.
 * Built in memory so no binary files live in the repository.
 */

export const buildZip = (
  files: Record<string, string | Buffer>,
  { stored = false }: { stored?: boolean } = {},
): Buffer => {
  const locals: Buffer[] = [];
  const centrals: Buffer[] = [];
  let offset = 0;
  for (const [name, content] of Object.entries(files)) {
    const nameBytes = Buffer.from(name, 'utf8');
    const data = Buffer.isBuffer(content) ? content : Buffer.from(content, 'utf8');
    const body = stored ? data : deflateRawSync(data);
    const checksum = crc32(data);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(stored ? 0 : 8, 8);
    local.writeUInt32LE(checksum, 14);
    local.writeUInt32LE(body.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(nameBytes.length, 26);
    locals.push(local, nameBytes, body);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(stored ? 0 : 8, 10);
    central.writeUInt32LE(checksum, 16);
    central.writeUInt32LE(body.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(nameBytes.length, 28);
    central.writeUInt32LE(offset, 42);
    centrals.push(central, nameBytes);
    offset += 30 + nameBytes.length + body.length;
  }
  const directory = Buffer.concat(centrals);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(Object.keys(files).length, 8);
  end.writeUInt16LE(Object.keys(files).length, 10);
  end.writeUInt32LE(directory.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, directory, end]);
};

const XML = '<?xml version="1.0" encoding="UTF-8"?>';
const contentTypes = (overrides: string) =>
  `${XML}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/>${overrides}</Types>`;
const relationships = (items: [string, string, string][]) =>
  `${XML}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${items
    .map(
      ([id, type, target]) =>
        `<Relationship Id="${id}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/${type}" Target="${target}"/>`,
    )
    .join('')}</Relationships>`;

const W = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"';
/** `paragraphs` are WordprocessingML body children. */
export const docxFixture = (body: string): Buffer =>
  buildZip({
    '[Content_Types].xml': contentTypes(
      '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>',
    ),
    '_rels/.rels': relationships([['rId1', 'officeDocument', 'word/document.xml']]),
    'word/document.xml': `${XML}<w:document ${W}><w:body>${body}</w:body></w:document>`,
  });

export const wordParagraph = (text: string): string =>
  `<w:p><w:r><w:t xml:space="preserve">${text}</w:t></w:r></w:p>`;

const P =
  'xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"';
export const pptxFixture = (slides: string[]): Buffer => {
  const files: Record<string, string> = {
    '[Content_Types].xml': contentTypes(
      '<Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>' +
        slides
          .map(
            (_, index) =>
              `<Override PartName="/ppt/slides/slide${index + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`,
          )
          .join(''),
    ),
    '_rels/.rels': relationships([['rId1', 'officeDocument', 'ppt/presentation.xml']]),
    'ppt/presentation.xml': `${XML}<p:presentation ${P}><p:sldIdLst>${slides
      .map((_, index) => `<p:sldId id="${256 + index}" r:id="rId${index + 1}"/>`)
      .join('')}</p:sldIdLst></p:presentation>`,
    'ppt/_rels/presentation.xml.rels': relationships(
      slides.map((_, index) => [`rId${index + 1}`, 'slide', `slides/slide${index + 1}.xml`]),
    ),
  };
  slides.forEach((text, index) => {
    files[`ppt/slides/slide${index + 1}.xml`] =
      `${XML}<p:sld ${P}><p:cSld><p:spTree><p:sp><p:txBody><a:p><a:r><a:t>${text}</a:t></a:r></a:p></p:txBody></p:sp></p:spTree></p:cSld></p:sld>`;
  });
  return buildZip(files);
};

const odf = (kind: 'text' | 'spreadsheet' | 'presentation', body: string): Buffer => {
  const mime = `application/vnd.oasis.opendocument.${kind}`;
  return buildZip(
    {
      // ODF requires this entry first and uncompressed.
      mimetype: mime,
      'META-INF/manifest.xml': `${XML}<manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0" manifest:version="1.2"><manifest:file-entry manifest:full-path="/" manifest:media-type="${mime}"/><manifest:file-entry manifest:full-path="content.xml" manifest:media-type="text/xml"/></manifest:manifest>`,
      'content.xml': `${XML}<office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0" xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0" xmlns:draw="urn:oasis:names:tc:opendocument:xmlns:drawing:1.0" office:version="1.2"><office:body>${body}</office:body></office:document-content>`,
    },
    { stored: true },
  );
};

export const odtFixture = (): Buffer =>
  odf(
    'text',
    '<office:text><text:h text:outline-level="1">Contract</text:h><text:p>Renewal on 1 May.</text:p></office:text>',
  );

export const odsFixture = (): Buffer =>
  odf(
    'spreadsheet',
    '<office:spreadsheet><table:table table:name="Q1"><table:table-row><table:table-cell office:value-type="string"><text:p>Revenue</text:p></table:table-cell><table:table-cell office:value-type="float" office:value="42"><text:p>42</text:p></table:table-cell></table:table-row></table:table></office:spreadsheet>',
  );

export const odpFixture = (): Buffer =>
  odf(
    'presentation',
    '<office:presentation><draw:page draw:name="page1"><draw:frame><draw:text-box><text:p>Roadmap</text:p></draw:text-box></draw:frame></draw:page></office:presentation>',
  );

export const rtfFixture = (): Buffer =>
  Buffer.from(
    '{\\rtf1\\ansi{\\fonttbl\\f0 Helvetica;}\\f0 Meeting notes\\par Ship on Friday.\\par}',
  );

/** One-page PDF with standard Helvetica text and a valid cross-reference table. */
export const pdfFixture = (lines: string[]): Buffer => {
  const content = `BT /F1 12 Tf 72 720 Td ${lines
    .map(
      (line, index) =>
        `${index ? '0 -16 Td ' : ''}(${line.replace(/[()\\]/g, '\\$&')}) Tj`,
    )
    .join(' ')} ET`;
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];
  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets
    .map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`)
    .join('')}trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(pdf, 'latin1');
};

/** XLSX written by exceljs, including a formatted date cell. */
export const xlsxFixture = async (): Promise<Buffer> => {
  const { default: ExcelJS } = await import('exceljs');
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Deals & Co');
  sheet.addRow(['Name', 'Amount', 'Closed', 'Won']);
  sheet.addRow(['Acme, Inc', 1250.5, new Date(Date.UTC(2026, 2, 14)), true]);
  sheet.getCell('C2').numFmt = 'yyyy-mm-dd';
  sheet.addRow(['Formula', { formula: 'B2*2', result: 2501 }, null, false]);
  workbook.addWorksheet('Empty');
  return Buffer.from(await workbook.xlsx.writeBuffer());
};
