import DOMPurify from 'dompurify';
import { cn } from 'erxes-ui';
import { useEffect, useRef } from 'react';

const ARTICLE_BODY_CLASS = cn(
  'text-sm leading-relaxed text-foreground',
  '[&_h1]:mt-4 [&_h1]:mb-2 [&_h1]:text-lg [&_h1]:font-bold',
  '[&_h2]:mt-4 [&_h2]:mb-2 [&_h2]:text-base [&_h2]:font-semibold',
  '[&_h3]:mt-3 [&_h3]:mb-1 [&_h3]:font-semibold',
  '[&_p]:mb-3 [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-5',
  '[&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1',
  '[&_a]:text-primary [&_a]:underline [&_strong]:font-semibold',
  '[&_img]:my-3 [&_img]:max-w-full [&_img]:rounded-lg',
  '[&_blockquote]:border-l-2 [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground',
  '[&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:text-xs',
  '[&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-muted [&_pre]:p-3',
);

export const KbArticleBody = ({ html }: { html: string }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.replaceChildren(
      DOMPurify.sanitize(html, { RETURN_DOM_FRAGMENT: true }),
    );
  }, [html]);

  return <div ref={ref} className={cn('mt-4', ARTICLE_BODY_CLASS)} />;
};
