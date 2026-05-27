import { Font } from '@react-pdf/renderer';

export const PDF_FONT_FAMILY = 'NotoSans';
export const PDF_FONT_FAMILY_BOLD = 'NotoSans';
export const PDF_FONT_FAMILY_SERIF = PDF_FONT_FAMILY;
export const PDF_FONT_FAMILY_SCRIPT = PDF_FONT_FAMILY;

const NOTO_SANS_BASE =
  'https://raw.githubusercontent.com/google/fonts/main/ofl/notosans';

const FONT_URLS = {
  regular: `${NOTO_SANS_BASE}/NotoSans%5Bwdth%2Cwght%5D.ttf`,
  bold: `${NOTO_SANS_BASE}/NotoSans%5Bwdth%2Cwght%5D.ttf`,
  italic: `${NOTO_SANS_BASE}/NotoSans-Italic%5Bwdth%2Cwght%5D.ttf`,
  boldItalic: `${NOTO_SANS_BASE}/NotoSans-Italic%5Bwdth%2Cwght%5D.ttf`,
} as const;

let registered = false;

export function registerPdfFonts(): void {
  if (registered) return;

  Font.register({
    family: PDF_FONT_FAMILY,
    fonts: [
      { src: FONT_URLS.regular, fontWeight: 'normal', fontStyle: 'normal' },
      { src: FONT_URLS.bold, fontWeight: 'bold', fontStyle: 'normal' },
      { src: FONT_URLS.italic, fontWeight: 'normal', fontStyle: 'italic' },
      {
        src: FONT_URLS.boldItalic,
        fontWeight: 'bold',
        fontStyle: 'italic',
      },
    ],
  });

  Font.registerHyphenationCallback((word) => [word]);

  registered = true;
}

registerPdfFonts();
