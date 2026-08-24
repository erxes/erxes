import Link from 'next/link';
import { Fragment } from 'react';
import { Icon } from './Icon';

export type Crumb = {
  label: string;
  href?: string;
};

export const Breadcrumbs = ({ items }: { items: Crumb[] }) => (
  <nav aria-label="Breadcrumb">
    <ol className="flex flex-wrap items-center gap-1.5 text-[13px] uppercase tracking-wide text-muted">
      {items.map((item, index) => (
        <Fragment key={`${item.label}-${index}`}>
          {index > 0 ? (
            <li aria-hidden="true" className="text-muted/60">
              <Icon name="chevronRight" size={13} />
            </li>
          ) : null}
          <li>
            {item.href ? (
              <Link
                href={item.href}
                className="text-brand transition-colors hover:text-brand-strong"
              >
                {item.label}
              </Link>
            ) : (
              <span className="font-semibold text-ink">{item.label}</span>
            )}
          </li>
        </Fragment>
      ))}
    </ol>
  </nav>
);
