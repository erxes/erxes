import Link from 'next/link';
import { Fragment } from 'react';
import { cn } from '@/modules/ui/lib/cn';
import { Icon } from './Icon';

export type Crumb = {
  label: string;
  href?: string;
};

export type BreadcrumbTone = 'default' | 'onHero';

const tones = {
  default: {
    list: 'text-muted-foreground',
    separator: 'text-muted-foreground/60',
    link: 'text-muted-foreground hover:text-brand',
    current: 'font-medium text-ink',
  },
  onHero: {
    list: 'text-white/60',
    separator: 'text-white/40',
    link: 'text-white/60 hover:text-white',
    current: 'font-medium text-white',
  },
} satisfies Record<BreadcrumbTone, Record<string, string>>;

export const Breadcrumbs = ({
  items,
  tone = 'default',
}: {
  items: Crumb[];
  tone?: BreadcrumbTone;
}) => {
  const styles = tones[tone];

  return (
    <nav aria-label="Breadcrumb">
      <ol
        className={cn(
          'flex flex-wrap items-center gap-1.5 text-[13px]',
          styles.list,
        )}
      >
        {items.map((item, index) => (
          <Fragment key={`${item.label}-${index}`}>
            {index > 0 ? (
              <li aria-hidden="true" className={styles.separator}>
                <Icon name="chevronRight" size={13} />
              </li>
            ) : null}
            <li>
              {item.href ? (
                <Link
                  href={item.href}
                  className={cn('transition-colors', styles.link)}
                >
                  {item.label}
                </Link>
              ) : (
                <span className={styles.current}>{item.label}</span>
              )}
            </li>
          </Fragment>
        ))}
      </ol>
    </nav>
  );
};
