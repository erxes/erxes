import { useAgentReferenceRegistry } from '../references/AgentReferenceScope';
import { cn } from 'erxes-ui';
import { memo, useMemo, type ReactNode } from 'react';
import remarkGfm from 'remark-gfm';
import ReactMarkdown, { type Components } from 'react-markdown';

import { repairTables } from './markdownRepair';
import { maskAgentReferences } from '../references/maskAgentReferences';
import type { IAgentReference } from '../references/parseAgentReferences';
import { withMaskedReferences } from './TextWithAgentReferences';

/**
 * Wide markdown tables scroll sideways inside the transcript instead of
 * squashing every column into a phone width; a table narrower than the column
 * still fills it (`min-w-full`). The horizontal scroll is contained so a
 * fling at the edge of a table does not start navigating the transcript.
 */
const isExternalHref = (href: string): boolean => {
  if (!/^(https?:|mailto:)/i.test(href)) return false;
  if (typeof window === 'undefined') return true;
  try {
    return (
      new URL(href, window.location.origin).origin !== window.location.origin
    );
  } catch {
    return false;
  }
};

const COMPONENTS: Components = {
  table: ({ children, className }) => (
    <div className="my-2 overflow-x-auto overscroll-x-contain">
      <table className={cn('w-auto max-w-full text-xs', className)}>
        {children}
      </table>
    </div>
  ),
  /**
   * Links the model emits only count if they leave the app: http(s)/mailto
   * open in a new tab; relative paths (`/deal/board?…`), hash anchors, and
   * any other scheme render as plain text — the model must use record
   * reference tokens, not workspace URLs.
   */
  a: ({ href, children }) =>
    href && isExternalHref(href) ? (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ) : (
      <span>{children}</span>
    ),
};

/**
 * The same component map with `[[type:id:label]]` record references
 * resolved into chips inside text-bearing elements only — `code`, `pre`,
 * and `a` are deliberately absent, so a token there stays literal.
 */
const componentsWithReferences = (
  references: IAgentReference[],
): Components => {
  const wrap = (children: ReactNode) =>
    withMaskedReferences(children, references);

  return {
    ...COMPONENTS,
    p: ({ children }) => <p>{wrap(children)}</p>,
    li: ({ children }) => <li>{wrap(children)}</li>,
    td: ({ children }) => <td>{wrap(children)}</td>,
    th: ({ children }) => <th>{wrap(children)}</th>,
    strong: ({ children }) => <strong>{wrap(children)}</strong>,
    em: ({ children }) => <em>{wrap(children)}</em>,
    blockquote: ({ children }) => <blockquote>{wrap(children)}</blockquote>,
    h1: ({ children }) => <h1>{wrap(children)}</h1>,
    h2: ({ children }) => <h2>{wrap(children)}</h2>,
    h3: ({ children }) => <h3>{wrap(children)}</h3>,
    h4: ({ children }) => <h4>{wrap(children)}</h4>,
    h5: ({ children }) => <h5>{wrap(children)}</h5>,
    h6: ({ children }) => <h6>{wrap(children)}</h6>,
  };
};

/**
 * Renders assistant text as markdown. LLM output routinely contains lists,
 * code, and emphasis; plain text rendering would mangle it. Styled through
 * element selectors because the workspace does not include the Tailwind
 * typography plugin.
 *
 * `remark-gfm` is what makes pipe tables render at all — without it the
 * parser is CommonMark-only and the rows show as literal `|` text. The
 * `repairTables` pre-pass normalizes the malformed tables the assistant
 * occasionally emits (missing separator row, several rows collapsed onto
 * one line); well-formed tables and non-table content pass through
 * untouched.
 */
const MarkdownBase = ({
  content,
  references = false,
}: {
  content: string;
  /** Render `[[type:id:label]]` tokens as inline record chips. */
  references?: boolean;
}) => {
  // Masking runs before repair + markdown: it swaps valid tokens for
  // alnum placeholders so emphasis/underscore characters inside labels
  // can never split a token, and skips code regions so literal tokens
  // stay literal there.
  const registry = useAgentReferenceRegistry();
  const masked = useMemo(
    () =>
      references
        ? maskAgentReferences(content, (handle) =>
            registry.byHandle.get(handle),
          )
        : { text: content, references: [] },
    [content, references, registry],
  );
  const repaired = useMemo(() => repairTables(masked.text), [masked.text]);
  const referenceComponents = useMemo(
    () => componentsWithReferences(masked.references),
    [masked.references],
  );

  return (
    <div
      className={[
        'max-w-none break-words text-[13px] leading-relaxed md:text-sm md:leading-6',
        'space-y-2',
        '[&_strong]:font-semibold',
        '[&_blockquote]:border-l-2 [&_blockquote]:border-muted-foreground/40 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-muted-foreground',
        '[&_hr]:my-4 [&_hr]:border-border',
        '[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5',
        'sm:[&_ul]:space-y-1 sm:[&_ol]:space-y-1',
        '[&_h1]:my-2 [&_h1]:text-base [&_h1]:font-semibold md:[&_h1]:text-lg',
        '[&_h2]:my-2 [&_h2]:text-base [&_h2]:font-semibold md:[&_h2]:text-lg',
        '[&_h3]:my-1.5 [&_h3]:text-sm [&_h3]:font-semibold md:[&_h3]:text-base',
        '[&_pre]:my-2 [&_pre]:overflow-x-auto [&_pre]:whitespace-pre-wrap [&_pre]:break-words [&_pre]:rounded-lg [&_pre]:border [&_pre]:bg-muted/60 [&_pre]:p-3 [&_pre]:text-xs md:[&_pre]:text-[13px]',
        '[&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:font-mono',
        '[&_code]:rounded-md [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-xs [&_code]:font-mono',
        '[&_a]:text-primary [&_a]:underline-offset-2 hover:[&_a]:underline',
        '[&_th]:border-b [&_th]:py-1.5 [&_th]:pr-3 [&_th]:text-left [&_th]:font-medium',
        '[&_td]:border-b [&_td]:py-1.5 [&_td]:pr-3',
      ].join(' ')}
    >
      <ReactMarkdown
        components={references ? referenceComponents : COMPONENTS}
        remarkPlugins={[remarkGfm]}
      >
        {repaired}
      </ReactMarkdown>
    </div>
  );
};

/**
 * Memoized so finalized markdown is neither re-repaired nor re-parsed while
 * the streaming tail updates: only a `content` change re-renders it.
 */
export const Markdown = memo(MarkdownBase);
