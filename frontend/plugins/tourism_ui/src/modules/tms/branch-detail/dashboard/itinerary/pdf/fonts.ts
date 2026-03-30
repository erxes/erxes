import { Font } from '@react-pdf/renderer';

/**
 * PDF font family name used across all PDF components.
 * Noto Sans supports Latin, Cyrillic (including Mongolian Cyrillic), and many
 * other scripts — making it safe for multilingual itinerary content.
 *
 * Fonts are loaded from the Google Fonts static CDN so there are zero
 * file-path or bundling issues regardless of dev / production / NX workspace
 * structure.  `@react-pdf/renderer` fetches & embeds them at render time.
 */
export const PDF_FONT_FAMILY = 'NotoSans';
export const PDF_FONT_FAMILY_BOLD = 'NotoSans';

// Google Fonts static CDN URLs (woff2 → ttf fallback not needed;
// @react-pdf/renderer can consume ttf directly from the CDN).
const NOTO_SANS_BASE =
  'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/notosans';

const FONT_URLS = {
  regular: `${NOTO_SANS_BASE}/NotoSans%5Bwdth%2Cwght%5D.ttf`,
  bold: `${NOTO_SANS_BASE}/NotoSans%5Bwdth%2Cwght%5D.ttf`,
  italic: `${NOTO_SANS_BASE}/NotoSans-Italic%5Bwdth%2Cwght%5D.ttf`,
  boldItalic: `${NOTO_SANS_BASE}/NotoSans-Italic%5Bwdth%2Cwght%5D.ttf`,
} as const;

let registered = false;

/**
 * Registers the Noto Sans font family with `@react-pdf/renderer`.
 *
 * Safe to call multiple times — registration is idempotent.
 * Must be called **before** any `<Document>` is rendered (e.g. at the top of
 * `ExportPDFButton` or in a module side-effect).
 */
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

  // Disable word hyphenation so Cyrillic words aren't broken incorrectly.
  Font.registerHyphenationCallback((word) => [word]);

  registered = true;
}

// Auto-register on import so consumers don't need to remember to call it.
registerPdfFonts();
