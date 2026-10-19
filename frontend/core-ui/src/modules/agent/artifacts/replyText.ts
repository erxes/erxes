import DOMPurify from 'dompurify';
import { parseAgentReferences } from '../references/parseAgentReferences';
import { splitArtifacts } from './parseArtifacts';

const htmlText = (html: string): string => {
  // Template content is inert; remove resource-bearing nodes before parsing.
  const template = document.createElement('template');
  template.innerHTML = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p',
      'div',
      'section',
      'article',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'ul',
      'ol',
      'li',
      'table',
      'thead',
      'tbody',
      'tr',
      'td',
      'th',
      'br',
      'pre',
      'code',
      'strong',
      'em',
      'span',
      'a',
    ],
    ALLOWED_ATTR: [],
  })
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(?:p|div|section|article|h[1-6]|li|tr|pre)>/gi, '\n')
    .replace(/<\/(?:td|th)>/gi, '\t');
  const text = template.content.textContent ?? '';
  return parseAgentReferences(text)
    .map((segment) =>
      segment.kind === 'reference' ? segment.reference.label : segment.text,
    )
    .join('')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

/** The transcript Copy action copies the visible reply; Source still copies HTML. */
export const getReplyCopyText = (content: string): string => {
  const segments = splitArtifacts(content);
  // Preserve the existing clipboard format for historical non-HTML replies.
  if (
    !segments.some((segment) =>
      segment.kind === 'artifact'
        ? segment.artifact.type === 'html'
        : /^\s*</.test(segment.text),
    )
  )
    return content;
  return segments
    .map((segment) => {
      if (segment.kind === 'text')
        return /^\s*</.test(segment.text)
          ? htmlText(segment.text)
          : segment.text;
      return segment.artifact.type === 'html'
        ? htmlText(segment.artifact.content)
        : segment.artifact.content;
    })
    .join('\n\n');
};
