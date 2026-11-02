import { resolveProductPdfAttachment } from '../pdfAttachments';

const pdf = { url: 'erxes-saas/abc-book.pdf', name: 'book.pdf', type: 'application/pdf', size: 1000 };
const otherPdf = { ...pdf, url: 'erxes-saas/def-book-v2.pdf' };
const pages = [{ url: 'erxes-saas/p1.jpg', name: 'page-1.jpg', type: 'image/jpeg' }];

describe('resolveProductPdfAttachment', () => {
  it('leaves the field untouched when pdfAttachment is not sent', () => {
    expect(resolveProductPdfAttachment({ pdfAttachment: undefined, previousPdfAttachment: { pages } })).toEqual({ value: undefined, needsRender: false });
  });

  it('clears pages when the PDF is removed', () => {
    expect(resolveProductPdfAttachment({ pdfAttachment: { pdf: null as any, pages: [] }, previousPdfAttachment: { pdf, pages } })).toEqual({ value: { pdf: undefined, pages: [] }, needsRender: false });
  });

  it('keeps stored pages for the same PDF', () => {
    expect(resolveProductPdfAttachment({ pdfAttachment: { pdf }, previousPdfAttachment: { pdf, pages } })).toEqual({ value: { pdf, pages }, needsRender: false });
  });

  it('keeps previous pages live and asks for rendering for a new PDF', () => {
    expect(resolveProductPdfAttachment({ pdfAttachment: { pdf: otherPdf }, previousPdfAttachment: { pages } })).toEqual({ value: { pdf: otherPdf, pages }, needsRender: true });
  });

  it('rejects non-PDF files', () => {
    expect(() => resolveProductPdfAttachment({ pdfAttachment: { pdf: { url: 'erxes-saas/x.png', name: 'x.png', type: 'image/png' } } })).toThrow('Only PDF files');
  });
});
