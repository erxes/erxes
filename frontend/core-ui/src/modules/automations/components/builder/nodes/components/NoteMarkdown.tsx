import Markdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';

/**
 * Note content is authored by one user and read by everyone else on the
 * automation, so it goes through rehype-sanitize.
 *
 * Element sizes are constrained here rather than left to browser defaults: a
 * note is a small box on a canvas, so an `h1` must not dwarf the flow nodes
 * around it.
 */
export const NoteMarkdown = ({ content }: { content: string }) => (
  <div
    className="size-full overflow-auto px-3 pb-3 text-sm leading-relaxed break-words
      [&_a]:text-primary [&_a]:underline
      [&_blockquote]:border-l-2 [&_blockquote]:border-current/30 [&_blockquote]:pl-2 [&_blockquote]:opacity-80
      [&_code]:rounded [&_code]:bg-foreground/5 [&_code]:px-1 [&_code]:text-[0.9em]
      [&_h1]:text-base [&_h1]:font-semibold
      [&_h2]:text-sm [&_h2]:font-semibold
      [&_h3]:text-sm [&_h3]:font-medium
      [&_hr]:my-2 [&_hr]:border-current/20
      [&_li]:my-0.5
      [&_ol]:list-decimal [&_ol]:pl-4
      [&_p]:my-1 [&_pre]:overflow-x-auto [&_pre]:rounded [&_pre]:bg-foreground/5 [&_pre]:p-2
      [&_table]:w-full [&_td]:border [&_td]:border-current/20 [&_td]:px-1
      [&_th]:border [&_th]:border-current/20 [&_th]:px-1
      [&_ul]:list-disc [&_ul]:pl-4
      [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
  >
    <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
      {content}
    </Markdown>
  </div>
);
