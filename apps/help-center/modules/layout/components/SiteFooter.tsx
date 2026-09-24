import Link from 'next/link';
import { SessionLink } from '@/modules/auth/components/SessionLink';
import {
  NEW_TICKET_REASON,
  NEW_TICKET_ROUTE,
} from '@/modules/tickets/constants/guard';
import { Container } from '@/modules/ui/components/Container';
import { Icon } from '@/modules/ui/components/Icon';
import type { PortalFooterView } from '../api';
import { site } from '../constants/site';

type FooterLink = { href: string; label: string; reason?: string };

type FooterColumn = { heading: string; links: FooterLink[] };

const supportLinks: FooterLink[] = [
  {
    href: NEW_TICKET_ROUTE,
    label: 'Submit a ticket',
    reason: NEW_TICKET_REASON,
  },
  { href: '/tickets/track', label: 'Track a ticket' },
  { href: '/tickets', label: 'My tickets' },
  { href: '/forms', label: 'Fill in a form' },
];

const formOnlyLinks: FooterLink[] = [
  { href: '/forms', label: 'Fill in a form' },
];

const knowledgeLinks: FooterLink[] = [
  { href: '/knowledge-base', label: 'All categories' },
  { href: '/search', label: 'Search' },
  { href: '/announcements', label: 'Announcements' },
];

const accountLinks: FooterLink[] = [
  { href: '/account', label: 'My account' },
  { href: '/account/notifications', label: 'Notifications' },
  { href: '/account/settings', label: 'Settings' },
  { href: '/sign-in', label: 'Sign in' },
  { href: '/sign-up', label: 'Sign up' },
];

const builtInColumns = (
  knowledgeBaseEnabled: boolean,
  ticketsEnabled: boolean,
): FooterColumn[] => [
  {
    heading: 'Support',
    links: ticketsEnabled ? supportLinks : formOnlyLinks,
  },
  ...(knowledgeBaseEnabled
    ? [{ heading: 'Knowledge base', links: knowledgeLinks }]
    : []),
  { heading: 'Account', links: accountLinks },
];

const isExternal = (href: string): boolean =>
  /^[a-z][\w+.-]*:|^\/\//i.test(href);

const linkClass = 'text-sm text-white/60 transition-colors hover:text-white';

const FooterColumnBlock = ({ heading, links }: FooterColumn) => (
  <div>
    <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/40">
      {heading}
    </h2>
    {links.length ? (
      <ul className="mt-4 space-y-3">
        {links.map((link) => (
          <li key={`${link.href}-${link.label}`}>
            {link.reason ? (
              <SessionLink
                href={link.href}
                reason={link.reason}
                className={linkClass}
              >
                {link.label}
              </SessionLink>
            ) : isExternal(link.href) ? (
              <a
                href={link.href}
                className={linkClass}
                rel="noreferrer noopener"
              >
                {link.label}
              </a>
            ) : (
              <Link href={link.href} className={linkClass}>
                {link.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    ) : null}
  </div>
);

export const SiteFooter = ({
  title,
  knowledgeBaseEnabled,
  ticketsEnabled,
  footer,
}: {
  title: string;
  knowledgeBaseEnabled: boolean;
  ticketsEnabled: boolean;
  footer: PortalFooterView;
}) => {
  const year = new Date().getFullYear();

  const columns: FooterColumn[] = footer.columns.length
    ? footer.columns.map((column) => ({
        heading: column.heading,
        links: column.links.map((link) => ({
          href: link.url,
          label: link.label,
        })),
      }))
    : builtInColumns(knowledgeBaseEnabled, ticketsEnabled);

  const description =
    footer.description ||
    `${title} — the ${site.brand} support portal. Search the knowledge base for your answer, and reach out to the support team if you cannot find it.`;

  const copyright = footer.copyright
    ? footer.copyright.replaceAll('{year}', String(year))
    : `© ${year} ${site.brand}. All rights reserved.`;

  return (
    <footer className="mt-auto border-t border-shell-line bg-shell text-white">
      <Container className="py-12">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-12">
          <div className="max-w-sm">
            {footer.logo ? (
              <img
                src={footer.logo}
                alt={title}
                className="h-8 w-auto max-w-44 object-contain"
              />
            ) : (
              <p className="text-xl font-semibold lowercase tracking-tight text-white">
                erxes
              </p>
            )}
            <p className="mt-3 text-sm leading-relaxed text-white/55">
              {description}
            </p>
          </div>

          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {columns.map((column, index) => (
              <FooterColumnBlock
                key={`${column.heading}-${index}`}
                heading={column.heading}
                links={column.links}
              />
            ))}
          </div>
        </div>
      </Container>

      <div className="border-t border-shell-line">
        <Container className="flex flex-col gap-3 py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[13px] text-white/45">{copyright}</p>
          <span className="inline-flex items-center gap-2 text-[13px] text-white/45">
            <Icon name="language" size={15} />
            {footer.languageLabel}
          </span>
        </Container>
      </div>
    </footer>
  );
};
