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
    label: 'Хүсэлт илгээх',
    reason: NEW_TICKET_REASON,
  },
  { href: '/tickets/track', label: 'Хүсэлт хянах' },
  { href: '/tickets', label: 'Миний хүсэлт' },
  { href: '/forms', label: 'Маягт бөглөх' },
];

const knowledgeLinks: FooterLink[] = [
  { href: '/knowledge-base', label: 'Бүх ангилал' },
  { href: '/search', label: 'Хайлт' },
  { href: '/announcements', label: 'Мэдээ мэдээлэл' },
];

const accountLinks: FooterLink[] = [
  { href: '/account', label: 'Миний хуудас' },
  { href: '/sign-in', label: 'Нэвтрэх' },
  { href: '/sign-up', label: 'Бүртгүүлэх' },
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

export const SiteFooter = ({ title }: { title: string }) => (
  <footer className="mt-auto border-t border-line bg-white">
    <Container className="py-14">
      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))] lg:gap-12">
        <div className="max-w-sm">
          <p className="text-xl font-semibold lowercase tracking-tight text-ink">
            er<span className="text-brand">x</span>es
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {title} — erxes дэмжлэгийн портал. Асуултынхаа хариултыг мэдлэгийн
            сангаас хайж олоод, олдохгүй бол дэмжлэгийн багт хандаарай.
          </p>
        </div>

        <FooterColumn heading="Дэмжлэг" links={supportLinks} />
        <FooterColumn heading="Мэдлэгийн сан" links={knowledgeLinks} />
        <FooterColumn heading="Бүртгэл" links={accountLinks} />
      </div>
    </Container>

    <div className="border-t border-line">
      <Container className="flex flex-col gap-3 py-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[13px] text-muted-foreground">
          © {new Date().getFullYear()} erxes. Бүх эрх хамгаалагдсан.
        </p>
        <span className="inline-flex items-center gap-2 text-[13px] text-muted-foreground">
          <Icon name="language" size={15} />
          Монгол
        </span>
      </Container>
    </div>
  </footer>
);
