import PDFDocument from 'pdfkit';
import * as QRCode from 'qrcode';


const toLatin1 = (value: string): string =>
  (value || '')
    .replace(/[—–]/g, '-')
    .split('')
    .filter((char) => char.charCodeAt(0) <= 0xff)
    .join('')
    .trim();


export const buildTicketsPdf = async (
  codes: string[],
  title: string,
): Promise<Buffer> => {
  const safeTitle = toLatin1(title) || 'Ticket';

  const qrBuffers = await Promise.all(
    codes.map((code) =>
      QRCode.toBuffer(code, {
        errorCorrectionLevel: 'M',
        margin: 2,
        width: 400,
      }),
    ),
  );

  const doc = new PDFDocument({ size: 'A6', margin: 24 });
  const chunks: Buffer[] = [];
  doc.on('data', (chunk: Buffer) => chunks.push(chunk));

  const done = new Promise<Buffer>((resolve, reject) => {
    doc.on('end', () =>
      resolve(Buffer.concat(chunks as unknown as readonly Uint8Array[])),
    );
    doc.on('error', reject);
  });

  codes.forEach((_, index) => {
    if (index > 0) {
      doc.addPage();
    }

    doc.fillColor('#111827').font('Helvetica-Bold').fontSize(15);
    doc.text(safeTitle, { align: 'center' });

    doc.moveDown(0.4);
    doc.fillColor('#6b7280').font('Helvetica').fontSize(11);
    doc.text(`Ticket ${index + 1} / ${codes.length}`, { align: 'center' });

    doc.moveDown(0.6);
    const imgSize = 140;
    const x = (doc.page.width - imgSize) / 2;
    doc.image(qrBuffers[index], x, doc.y, { fit: [imgSize, imgSize] });
  });

  doc.end();
  return done;
};
