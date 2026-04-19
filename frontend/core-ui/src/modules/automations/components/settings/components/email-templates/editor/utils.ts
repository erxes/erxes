export interface ReadinessCheck {
  label: string;
  description: string;
  tone: 'success' | 'warning';
}

export const countMatches = (source: string, pattern: RegExp) =>
  source.match(pattern)?.length ?? 0;

export const extractWords = (value: string) =>
  value.trim().split(/\s+/).filter(Boolean);

export const getReadinessChecks = (
  html: string,
  text: string,
): ReadinessCheck[] => {
  const headingCount = countMatches(html, /<h[1-3]\b/gi);
  const linkCount = countMatches(html, /<a\b[^>]*href=/gi);
  const imageCount = countMatches(html, /<img\b/gi);
  const imageAltCount = countMatches(html, /<img\b[^>]*alt=/gi);
  const htmlBytes = new Blob([html]).size;

  return [
    {
      label: headingCount > 0 ? 'Content hierarchy ready' : 'Add a heading',
      description:
        headingCount > 0
          ? `${headingCount} heading block detected`
          : 'Emails need at least one heading to anchor the message',
      tone: headingCount > 0 ? 'success' : 'warning',
    },
    {
      label: linkCount > 0 ? 'CTA detected' : 'No CTA found',
      description:
        linkCount > 0
          ? `${linkCount} clickable link${linkCount > 1 ? 's' : ''} found`
          : 'Add at least one button or link so the email can drive action',
      tone: linkCount > 0 ? 'success' : 'warning',
    },
    {
      label:
        htmlBytes < 100_000 ? 'HTML size looks safe' : 'HTML output is heavy',
      description:
        htmlBytes < 100_000
          ? `${Math.round(htmlBytes / 1024)} KB output`
          : `${Math.round(htmlBytes / 1024)} KB — consider simplifying the layout`,
      tone: htmlBytes < 100_000 ? 'success' : 'warning',
    },
    {
      label:
        text.trim().length > 80
          ? 'Plain text fallback usable'
          : 'Text fallback is thin',
      description:
        text.trim().length > 80
          ? `${extractWords(text).length} words in plain text export`
          : 'Add more body copy so the text version stays meaningful',
      tone: text.trim().length > 80 ? 'success' : 'warning',
    },
    {
      label:
        imageCount === 0 || imageAltCount === imageCount
          ? 'Image accessibility passes'
          : 'Some images are missing alt text',
      description:
        imageCount === 0
          ? 'No images inserted'
          : `${imageAltCount}/${imageCount} images include alt text`,
      tone:
        imageCount === 0 || imageAltCount === imageCount ? 'success' : 'warning',
    },
  ];
};
