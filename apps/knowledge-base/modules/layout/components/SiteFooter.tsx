import Link from 'next/link';
import { SessionLink } from '@/modules/auth/components/SessionLink';
import {
  NEW_TICKET_REASON,
  NEW_TICKET_ROUTE,
} from '@/modules/tickets/constants/guard';
import { Container } from '@/modules/ui/components/Container';
import { Icon } from '@/modules/ui/components/Icon';

type FooterLink = { href: string; label: string; reason?: string };

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
  { href: '/sign-in', label: 'Sign in' },
  { href: '/sign-up', label: 'Sign up' },
];

const linkClass = 'text-sm text-ink-soft transition-colors hover:text-brand';

const FooterColumn = ({
  heading,
  links,
}: {
  heading: string;
  links: FooterLink[];
}) => (
  <div>
    <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
      {heading}
    </h2>
    <ul className="mt-4 space-y-3">
      {links.map((link) => (
        <li key={link.href}>
          {link.reason ? (
            <SessionLink
              href={link.href}
              reason={link.reason}
              className={linkClass}
            >
              {link.label}
            </SessionLink>
          ) : (
            <Link href={link.href} className={linkClass}>
              {link.label}
            </Link>
          )}
        </li>
      ))}
    </ul>
  </div>
);

export const SiteFooter = ({
  title,
  knowledgeBaseEnabled,
  ticketsEnabled,
}: {
  title: string;
  knowledgeBaseEnabled: boolean;
  ticketsEnabled: boolean;
}) => (
  <footer className="mt-auto border-t border-line bg-(--color-footer)">
    <Container className="py-12">
      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))] lg:gap-12">
        <div className="max-w-sm">
          <p className="text-xl font-semibold lowercase tracking-tight text-ink">
            er<span className="text-brand">x</span>es
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {title} — the erxes support portal. Search the knowledge base for
            your answer, and reach out to the support team if you cannot find
            it.
          </p>
        </div>

        {ticketsEnabled ? (
          <FooterColumn heading="Support" links={supportLinks} />
        ) : (
          <FooterColumn heading="Support" links={formOnlyLinks} />
        )}
        {knowledgeBaseEnabled ? (
          <FooterColumn heading="Knowledge base" links={knowledgeLinks} />
        ) : null}
        <FooterColumn heading="Account" links={accountLinks} />
      </div>
    </Container>

    <div className="border-t border-line">
      <Container className="flex flex-col gap-3 py-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[13px] text-muted-foreground">
          © {new Date().getFullYear()} erxes. All rights reserved.
        </p>
        <span className="inline-flex items-center gap-2 text-[13px] text-muted-foreground">
          <Icon name="language" size={15} />
          English
        </span>
      </Container>
    </div>
  </footer>
);
