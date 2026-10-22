import { uploadFileToStorage } from 'erxes-api-shared/utils';
import { downloadWhatsappMedia } from '../graphApi';
import { getSafeWhatsappMimeType, storeWhatsappMedia } from '../utils/media';

jest.mock('erxes-api-shared/utils', () => ({
  sanitizeFilename: (name: string) => name,
  uploadFileToStorage: jest.fn().mockResolvedValue('stored-key'),
}));
jest.mock('../graphApi', () => ({ downloadWhatsappMedia: jest.fn() }));

const store = (media: object, downloadedType?: string) => {
  jest.mocked(downloadWhatsappMedia).mockResolvedValue({
    buffer: Buffer.from('file'),
    mimeType: downloadedType,
  });

  return storeWhatsappMedia({
    subdomain: 'tenant',
    accessToken: 'token',
    media: { id: 'media-1', kind: 'document', ...media },
  });
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('getSafeWhatsappMimeType', () => {
  it('keeps media and office types and makes the rest a download', () => {
    expect(getSafeWhatsappMimeType('image/jpeg')).toBe('image/jpeg');
    expect(getSafeWhatsappMimeType('application/pdf')).toBe('application/pdf');
    expect(
      getSafeWhatsappMimeType(
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ),
    ).toBe(
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    );
    expect(getSafeWhatsappMimeType('text/html')).toBe(
      'application/octet-stream',
    );
    expect(getSafeWhatsappMimeType('image/svg+xml')).toBe(
      'application/octet-stream',
    );
  });
});

describe('storeWhatsappMedia', () => {
  it('stores an HTML document as an opaque download with an inert name', async () => {
    await expect(
      store({ fileName: 'invoice.html', mimeType: 'text/html; charset=utf-8' }),
    ).resolves.toMatchObject({
      name: 'invoice.html.txt',
      type: 'application/octet-stream',
    });
    expect(uploadFileToStorage).toHaveBeenCalledWith(
      expect.objectContaining({
        fileName: 'invoice.html.txt',
        mimetype: 'application/octet-stream',
      }),
    );
  });

  it('neutralises an SVG whatever type the sender declared', async () => {
    await expect(
      store({ fileName: '../logo.SVG', mimeType: 'image/png' }),
    ).resolves.toMatchObject({ name: 'logo.SVG.txt', type: 'image/png' });
  });

  it('keeps ordinary documents and media untouched', async () => {
    await expect(
      store({ fileName: 'report.pdf', mimeType: 'application/pdf' }),
    ).resolves.toMatchObject({ name: 'report.pdf', type: 'application/pdf' });
    await expect(store({ kind: 'image' }, 'image/jpeg')).resolves.toMatchObject(
      { name: 'whatsapp-image.jpg', type: 'image/jpeg' },
    );
  });
});
