import {
  extractFileText,
  fileExtension,
  isImageType,
  MAX_EXTRACT_CHARS,
} from '../extract';
import {
  buildAttachmentManifest,
  historyAttachmentNote,
  formatBytes,
} from '../chatContent';
import { evaluateStorageConfigs } from '../storage';

describe('extract', () => {
  it('detects file extensions and image types', () => {
    expect(fileExtension('report.PDF')).toBe('pdf');
    expect(fileExtension('noext')).toBe('');
    expect(isImageType('photo.PNG')).toBe(true);
    expect(isImageType('doc.pdf')).toBe(false);
    expect(isImageType('blob', 'image/jpeg')).toBe(true);
  });

  it('extracts plain text and json', async () => {
    const txt = await extractFileText({
      buffer: Buffer.from('hello world'),
      name: 'a.txt',
    });
    expect(txt.content).toBe('hello world');
    expect(txt.truncated).toBe(false);

    const json = await extractFileText({
      buffer: Buffer.from('{"a":1}'),
      name: 'data.json',
      mimeType: 'application/json',
    });
    expect(json.content).toContain('"a"');
  });

  it('strips html down to readable text', async () => {
    const html =
      '<html><head><style>.x{}</style></head><body><h1>Title</h1><script>evil()</script><p>Body &amp; more</p></body></html>';
    const out = await extractFileText({
      buffer: Buffer.from(html),
      name: 'page.html',
    });
    expect(out.content).toContain('Title');
    expect(out.content).toContain('Body & more');
    expect(out.content).not.toContain('evil');
  });

  it('truncates oversized text with a notice', async () => {
    const big = 'x'.repeat(MAX_EXTRACT_CHARS + 100);
    const out = await extractFileText({
      buffer: Buffer.from(big),
      name: 'big.txt',
    });
    expect(out.truncated).toBe(true);
    expect(out.content).toContain('truncated');
  });

  it('extracts xlsx sheets as csv rows', async () => {
    const { default: ExcelJS } = await import('exceljs');
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Deals');
    ws.addRow(['name', 'amount']);
    ws.addRow(['Acme deal', 500]);
    const buf = Buffer.from(await wb.xlsx.writeBuffer());

    const out = await extractFileText({ buffer: buf, name: 'deals.xlsx' });
    expect(out.format).toBe('xlsx');
    expect(out.content).toContain('Sheet: Deals');
    expect(out.content).toContain('Acme deal,500');
  });

  it('rejects images and unknown binary formats with clear errors', async () => {
    await expect(
      extractFileText({ buffer: Buffer.from(''), name: 'pic.png' }),
    ).rejects.toThrow(/image/i);
    await expect(
      extractFileText({ buffer: Buffer.from(''), name: 'archive.zip' }),
    ).rejects.toThrow(/Unsupported/);
    await expect(
      extractFileText({ buffer: Buffer.from(''), name: 'old.doc' }),
    ).rejects.toThrow(/docx or \.pdf/);
  });
});

describe('chatContent', () => {
  const docs = [
    { url: 'key-1', name: 'report.pdf', type: 'application/pdf', size: 2048 },
    { url: 'key-2', name: 'photo.png', type: 'image/png', size: 1024 },
  ];

  it('builds a manifest with keys and per-kind guidance', () => {
    const manifest = buildAttachmentManifest(docs);
    expect(manifest).toContain('"report.pdf"');
    expect(manifest).toContain('key: "key-1"');
    expect(manifest).toContain('read-attachment');
    expect(manifest).toContain('never call read-attachment for an image');
  });

  it('builds compact history notes', () => {
    const note = historyAttachmentNote(docs);
    expect(note).toContain('"report.pdf" (key: "key-1")');
    expect(note).toContain('read-attachment');
  });

  it('formats byte sizes', () => {
    expect(formatBytes()).toBe('');
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(2048)).toBe('2.0 KB');
    expect(formatBytes(3 * 1024 * 1024)).toBe('3.0 MB');
  });
});

describe('storage detection', () => {
  it('treats local storage as always configured', () => {
    expect(evaluateStorageConfigs({ UPLOAD_SERVICE_TYPE: 'local' })).toEqual({
      configured: true,
      serviceType: 'local',
    });
  });

  it('requires AWS credentials for the default AWS service', () => {
    expect(evaluateStorageConfigs({}).configured).toBe(false);
    expect(
      evaluateStorageConfigs({
        AWS_BUCKET: 'b',
        AWS_ACCESS_KEY_ID: 'k',
        AWS_SECRET_ACCESS_KEY: 's',
      }),
    ).toEqual({ configured: true, serviceType: 'AWS' });
  });

  it('checks azure and gcs requirements', () => {
    expect(
      evaluateStorageConfigs({
        UPLOAD_SERVICE_TYPE: 'AZURE',
        AZURE_STORAGE_CONNECTION_STRING: 'cs',
        AZURE_STORAGE_CONTAINER: 'c',
      }).configured,
    ).toBe(true);
    expect(
      evaluateStorageConfigs({ UPLOAD_SERVICE_TYPE: 'GCS' }).configured,
    ).toBe(false);
  });
});
