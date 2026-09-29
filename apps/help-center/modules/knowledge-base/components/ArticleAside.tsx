import Link from 'next/link';
import { Icon } from '@/modules/ui/components/Icon';
import { Spotlight } from '@/modules/ui/components/Spotlight';
import type { PortalArticle } from '../utils/normalize';

export const ArticleAside = ({
  categoryTitle,
  categoryHref,
  related,
}: {
  categoryTitle: string;
  categoryHref: string;
  related: PortalArticle[];
}) => (
  <aside className="space-y-4 lg:sticky lg:top-6">
    {related.length ? (
      <Spotlight className="rounded-2xl bg-white p-5 shadow-shell">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          More in {categoryTitle}
        </h2>

        <ul className="mt-3 flex flex-col">
          {related.map((item) => (
            <li key={item._id}>
              <Link
                href={`/knowledge-base/article/${item._id}`}
                className="group -mx-2.5 flex items-start gap-2 rounded-lg px-2.5 py-2 text-[13px] leading-relaxed text-ink-soft outline-none transition-colors duration-300 ease-out-soft hover:bg-subtle hover:text-brand focus-visible:bg-subtle focus-visible:text-brand"
              >
                <span className="min-w-0 flex-1">{item.title}</span>
                <Icon
                  name="chevronRight"
                  size={14}
                  className="mt-0.5 shrink-0 text-muted-foreground/40 transition-[transform,color] duration-500 ease-out-soft group-hover:translate-x-0.5 group-hover:text-brand"
                />
              </Link>
            </li>
          ))}
        </ul>

        <Link
          href={categoryHref}
          className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-semibold text-brand outline-none transition-colors hover:text-brand-strong focus-visible:underline"
        >
          All articles
          <Icon name="chevronRight" size={13} />
        </Link>
      </Spotlight>
    ) : null}

    <Spotlight className="rounded-2xl bg-white p-5 shadow-shell">
      <h2 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        <Icon name="smile" size={14} className="text-brand" />
        Still stuck?
      </h2>
      <p className="mt-2.5 text-[13px] leading-relaxed text-muted-foreground">
        Raise a ticket and the support team will get back to you.
      </p>
      <Link
        href="/tickets/new"
        className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand outline-none transition-colors hover:text-brand-strong focus-visible:underline"
      >
        Submit a ticket
        <Icon name="chevronRight" size={13} />
      </Link>
    </Spotlight>
  </aside>
);
