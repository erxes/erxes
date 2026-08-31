import type { ReactNode } from 'react';
import { readPortalEnv } from '@/modules/apollo/utils/env';
import {
  inlineOf,
  parseBlocks,
  type Block,
  type InlineNode,
} from '@/modules/ui/lib/blocks';
import { cn } from '@/modules/ui/lib/cn';

/** Attachments are stored by key, which only resolves through the erxes reader. */
const fileUrl = (value: string, apiUrl: string): string =>
  /^(https?:)?\/\//.test(value) || value.startsWith('/')
    ? value
    : `${apiUrl}/read-file?key=${encodeURIComponent(value)}`;

const Inline = ({ nodes }: { nodes: InlineNode[] }) => (
  <>
    {nodes.map((node, index) => {
      if (node.type === 'link') {
        return (
          <a
            key={index}
            href={node.href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-brand underline underline-offset-2 hover:text-brand-strong"
          >
            {node.content?.length ? (
              <Inline nodes={node.content} />
            ) : (
              node.href
            )}
          </a>
        );
      }

      const text = node.text ?? '';

      if (!text) {
        return null;
      }

      const styles = node.styles ?? {};
      const className = cn(
        styles.bold && 'font-semibold',
        styles.italic && 'italic',
        styles.underline && 'underline',
        styles.strike && 'line-through',
      );

      if (styles.code) {
        return (
          <code
            key={index}
            className={cn(
              'rounded bg-subtle px-1 py-0.5 font-mono text-[13px]',
              className,
            )}
          >
            {text}
          </code>
        );
      }

      return className ? (
        <span key={index} className={className}>
          {text}
        </span>
      ) : (
        text
      );
    })}
  </>
);

const HEADINGS: Record<number, 'h3' | 'h4' | 'h5'> = { 1: 'h3', 2: 'h4', 3: 'h5' };

const LISTS: Record<string, 'ul' | 'ol'> = {
  bulletListItem: 'ul',
  numberedListItem: 'ol',
  checkListItem: 'ul',
};

const renderBlocks = (blocks: Block[], apiUrl: string): ReactNode[] => {
  const out: ReactNode[] = [];
  let run: { type: string; tag: 'ul' | 'ol'; items: Block[] } | null = null;

  const flush = () => {
    const list = run;

    if (!list) {
      return;
    }

    run = null;

    const Tag = list.tag;
    const checks = list.type === 'checkListItem';

    out.push(
      <Tag
        key={`list-${out.length}`}
        className={cn(
          'my-2 space-y-1',
          checks ? 'list-none' : 'pl-5',
          !checks && (Tag === 'ol' ? 'list-decimal' : 'list-disc'),
        )}
      >
        {list.items.map((item, index) => (
          <li key={item.id ?? index}>
            {checks ? (
              <span className="mr-2 text-muted-foreground">
                {item.props?.checked ? '☑' : '☐'}
              </span>
            ) : null}
            <Inline nodes={inlineOf(item)} />
            {item.children?.length ? renderBlocks(item.children, apiUrl) : null}
          </li>
        ))}
      </Tag>,
    );
  };

  blocks.forEach((block, index) => {
    const key = block.id ?? `block-${index}`;
    const type = block.type ?? 'paragraph';
    const tag = LISTS[type];

    if (tag) {
      if (run && run.type !== type) {
        flush();
      }

      run = run ?? { type, tag, items: [] };
      run.items.push(block);
      return;
    }

    flush();

    if (type === 'image') {
      const url = block.props?.url;

      if (url) {
        out.push(
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={key}
            src={fileUrl(url, apiUrl)}
            alt={block.props?.caption || block.props?.name || 'Хавсралт'}
            className="my-3 max-w-full rounded-lg border border-line"
          />,
        );
      }

      return;
    }

    if (type === 'codeBlock') {
      out.push(
        <pre
          key={key}
          className="my-3 overflow-x-auto rounded-lg bg-subtle p-3 font-mono text-[13px] text-ink"
        >
          <code>
            <Inline nodes={inlineOf(block)} />
          </code>
        </pre>,
      );
      return;
    }

    if (type === 'quote') {
      out.push(
        <blockquote
          key={key}
          className="my-2 border-l-2 border-line pl-3 text-muted-foreground"
        >
          <Inline nodes={inlineOf(block)} />
        </blockquote>,
      );
      return;
    }

    if (type === 'heading') {
      const Tag = HEADINGS[block.props?.level ?? 1] ?? 'h5';

      out.push(
        <Tag key={key} className="mt-4 mb-1.5 font-semibold text-ink first:mt-0">
          <Inline nodes={inlineOf(block)} />
        </Tag>,
      );
      return;
    }

    const nodes = inlineOf(block);

    /* An empty paragraph is the editor's blank line, so it keeps its space. */
    out.push(
      <p key={key} className={nodes.length ? 'my-2 first:mt-0' : 'h-3'}>
        <Inline nodes={nodes} />
      </p>,
    );
  });

  flush();

  return out;
};

export const BlockText = ({
  content,
  className,
}: {
  content: string;
  className?: string;
}) => {
  const blocks = parseBlocks(content);

  if (!blocks) {
    return <p className={cn('whitespace-pre-line', className)}>{content}</p>;
  }

  const { apiUrl } = readPortalEnv();

  return (
    <div className={cn('[&>*:last-child]:mb-0', className)}>
      {renderBlocks(blocks, apiUrl)}
    </div>
  );
};
