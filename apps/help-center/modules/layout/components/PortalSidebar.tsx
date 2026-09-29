'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon, type IconName } from '@/modules/ui/components/Icon';
import { cn } from '@/modules/ui/lib/cn';

export type SidebarLink = {
  href: string;
  label: string;
  icon: IconName;
};

export type SidebarCategory = {
  _id: string;
  title: string;
  articleCount: number;
};

export type SidebarSection = {
  _id: string;
  title: string;
  icon: IconName;
  href: string;
  articleCount: number;
  categories: SidebarCategory[];
};

const isActive = (href: string, pathname: string) =>
  href === '/' ? pathname === '/' : pathname.startsWith(href.split('#')[0]);

export const PortalSidebar = ({
  links,
  sections,
}: {
  links: SidebarLink[];
  sections: SidebarSection[];
}) => {
  const pathname = usePathname();

  return (
    <nav aria-label="Portal" className="flex flex-col gap-7 text-[13px]">
      <ul className="flex flex-col gap-0.5">
        {links.map((link) => {
          const active = isActive(link.href, pathname);

          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-2.5 rounded-lg px-2.5 py-2 font-medium transition-colors duration-150',
                  active
                    ? 'bg-brand-soft text-brand'
                    : 'text-ink-soft hover:bg-subtle hover:text-ink',
                )}
              >
                <Icon name={link.icon} size={16} className="shrink-0" />
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>

      {sections.length ? (
        <div>
          <p className="px-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Knowledge base
          </p>

          <div className="mt-2 flex flex-col gap-4">
            {sections.map((section) => {
              const sectionActive =
                !section.categories.length &&
                pathname === `/knowledge-base/category/${section._id}`;

              return (
                <div key={section._id}>
                  <Link
                    href={section.href}
                    aria-current={sectionActive ? 'page' : undefined}
                    className={cn(
                      'flex items-baseline gap-2 rounded-lg px-2.5 py-1.5 font-semibold transition-colors duration-150 hover:text-brand',
                      sectionActive ? 'text-brand' : 'text-ink',
                    )}
                  >
                    <span className="min-w-0 flex-1 truncate">
                      {section.title}
                    </span>
                    {!section.categories.length ? (
                      <span className="shrink-0 text-[12px] font-normal tabular-nums text-muted-foreground">
                        {section.articleCount}
                      </span>
                    ) : null}
                  </Link>

                  {section.categories.length ? (
                    <ul className="ml-2.5 mt-0.5 border-l border-line pl-2.5">
                      {section.categories.map((category) => {
                        const href = `/knowledge-base/category/${category._id}`;
                        const active = pathname === href;

                        return (
                          <li key={category._id}>
                            <Link
                              href={href}
                              aria-current={active ? 'page' : undefined}
                              className={cn(
                                'flex items-baseline gap-2 rounded-md px-2.5 py-1.5 transition-colors duration-150',
                                active
                                  ? 'font-semibold text-brand'
                                  : 'text-ink-soft hover:text-brand',
                              )}
                            >
                              <span className="min-w-0 flex-1 truncate">
                                {category.title}
                              </span>
                              <span className="shrink-0 tabular-nums text-muted-foreground">
                                {category.articleCount}
                              </span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </nav>
  );
};
