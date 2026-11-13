import {
  maskAgentReferences,
  AGENT_REFERENCE_PLACEHOLDER_PATTERN,
} from '../references/maskAgentReferences';
import {
  referenceIdentity,
  type IAgentReferenceRegistry,
} from '../references/referenceRegistry';
import DOMPurify from 'dompurify';
import { splitArtifacts } from './parseArtifacts';

const labelsFor = (
  text: string,
  registry?: IAgentReferenceRegistry,
): string => {
  const masked = maskAgentReferences(
    text,
    registry ? (handle) => registry.byHandle.get(handle) : undefined,
  );
  return masked.text.replace(
    AGENT_REFERENCE_PLACEHOLDER_PATTERN,
    (raw, index: string) => {
      const reference = masked.references[Number(index)];
      return reference
        ? registry?.byIdentity.get(referenceIdentity(reference))?.label ??
            reference.label
        : raw;
    },
  );
};

const htmlText = (html: string, registry?: IAgentReferenceRegistry): string => {
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
  const walker = document.createTreeWalker(template.content, 4);
  let node = walker.nextNode();
  while (node) {
    if (!node.parentElement?.closest('code,pre,a'))
      node.textContent = labelsFor(node.textContent ?? '', registry);
    node = walker.nextNode();
  }
  return (template.content.textContent ?? '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

/** The transcript Copy action copies the visible reply; Source still copies HTML. */
export const getReplyCopyText = (
  content: string,
  registry?: IAgentReferenceRegistry,
): string => {
  const segments = splitArtifacts(content);
  // Preserve the existing clipboard format for historical non-HTML replies.
  if (
    !segments.some((segment) =>
      segment.kind === 'artifact'
        ? segment.artifact.type === 'html'
        : /^\s*</.test(segment.text),
    )
  )
    return registry ? labelsFor(content, registry) : content;
  return segments
    .map((segment) => {
      if (segment.kind === 'text')
        return /^\s*</.test(segment.text)
          ? htmlText(segment.text, registry)
          : segment.text;
      return segment.artifact.type === 'html'
        ? htmlText(segment.artifact.content, registry)
        : segment.artifact.content;
    })
    .join('\n\n');
};
