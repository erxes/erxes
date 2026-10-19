import type { IAgentReferenceRegistry } from '../references/referenceRegistry';
import {
  parseInline,
  parseMarkdownBlocks,
  type IMdInline,
} from './converters/mdBlocks';
import {
  maskAgentReferences,
  AGENT_REFERENCE_PLACEHOLDER_PATTERN,
} from '../references/maskAgentReferences';
import { repairTables } from '../components/markdownRepair';
import { splitArtifacts } from './parseArtifacts';

const escapeHtml = (text: string): string =>
  text.replace(
    /[&<>"']/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      }[character] ?? character),
  );

const inlineHtml = (inlines: IMdInline[]): string =>
  inlines
    .map((inline) => {
      const text = escapeHtml(inline.text);
      if (inline.code) return `<code>${text}</code>`;
      if (inline.bold) return `<strong>${text}</strong>`;
      if (inline.italic) return `<em>${text}</em>`;
      if (inline.href && /^(https?:|mailto:)/i.test(inline.href)) {
        return `<a href="${escapeHtml(inline.href)}">${text}</a>`;
      }
      return text;
    })
    .join('');

/** Old threads and providers that ignore the format still use the same HTML view. */
export const replyToHtml = (
  text: string,
  registry?: IAgentReferenceRegistry,
): string => {
  if (/^\s*</.test(text)) return text;
  // Decode old fenced responses for display only. A fence, filename or marker
  // in assistant text can never create a file card or downloadable artifact.
  const legacy = splitArtifacts(text);
  if (legacy.some((segment) => segment.kind === 'artifact')) {
    return legacy
      .map((segment) =>
        segment.kind === 'text'
          ? replyToHtml(segment.text, registry)
          : segment.artifact.type === 'html'
          ? segment.artifact.content
          : `<pre><code>${escapeHtml(segment.artifact.content)}</code></pre>`,
      )
      .join('\n');
  }
  const masked = maskAgentReferences(
    text,
    registry ? (handle) => registry.byHandle.get(handle) : undefined,
  );
  const html = parseMarkdownBlocks(repairTables(masked.text))
    .map((block) => {
      switch (block.type) {
        case 'heading':
          return `<h${block.level}>${inlineHtml(block.inlines)}</h${
            block.level
          }>`;
        case 'paragraph':
          return `<p>${inlineHtml(block.inlines)}</p>`;
        case 'quote':
          return `<blockquote>${inlineHtml(block.inlines)}</blockquote>`;
        case 'code':
          return `<pre><code>${escapeHtml(block.text)}</code></pre>`;
        case 'hr':
          return '<hr>';
        case 'list': {
          const tag = block.ordered ? 'ol' : 'ul';
          return `<${tag}>${block.items
            .map((item) => `<li>${inlineHtml(item)}</li>`)
            .join('')}</${tag}>`;
        }
        case 'table':
          return `<table><thead><tr>${block.header
            .map((cell) => `<th>${inlineHtml(parseInline(cell))}</th>`)
            .join('')}</tr></thead><tbody>${block.rows
            .map(
              (row) =>
                `<tr>${row
                  .map((cell) => `<td>${inlineHtml(parseInline(cell))}</td>`)
                  .join('')}</tr>`,
            )
            .join('')}</tbody></table>`;
      }
    })
    .join('\n');
  return html.replace(
    AGENT_REFERENCE_PLACEHOLDER_PATTERN,
    (match, index: string) => {
      const reference = masked.references[Number(index)];
      return reference
        ? escapeHtml(`[[${reference.type}:${reference.id}:${reference.label}]]`)
        : match;
    },
  );
};
