import Link from 'next/link';
import { SessionLink } from '@/modules/auth/components/SessionLink';
import { LanguageSwitcher } from '@/modules/i18n/components/LanguageSwitcher';
import { getT } from '@/modules/i18n/server';
import { savedLabel } from '@/modules/i18n/savedLabel';
import type { Translate } from '@/modules/i18n/translate';
import { NEW_TICKET_ROUTE } from '@/modules/tickets/constants/guard';
import { Container } from '@/modules/ui/components/Container';
import type { KnowledgeBaseName } from '@/modules/knowledge-base/utils/label';
import type { PortalFooterView } from '../api';
import { site } from '../constants/site';

type FooterLink = { href: string; label: string; reason?: string };

type FooterColumn = { heading: string; links: FooterLink[] };

const builtInColumns = (
  knowledgeBaseEnabled: boolean,
  knowledgeBase: KnowledgeBaseName,
  ticketsEnabled: boolean,
  t: Translate,
): FooterColumn[] => [
  {
    heading: t('footer.support'),
    links: ticketsEnabled
      ? [
          {
            href: NEW_TICKET_ROUTE,
            label: t('tickets.submit'),
            reason: t('tickets.signInReason'),
          },
          { href: '/tickets/track', label: t('tickets.track') },
          { href: '/tickets', label: t('tickets.mine') },
          { href: '/forms', label: t('forms.fillIn') },
        ]
      : [{ href: '/forms', label: t('forms.fillIn') }],
  },
  ...(knowledgeBaseEnabled
    ? [
        {
          heading: knowledgeBase.title,
          links: [
            { href: '/knowledge-base', label: t('kb.allCategories') },
            { href: '/search', label: t('common.search') },
            { href: '/announcements', label: t('nav.announcements') },
          ],
        },
      ]
    : []),
  {
    heading: t('footer.account'),
    links: [
      { href: '/account', label: t('account.mine') },
      { href: '/account/notifications', label: t('account.notifications') },
      { href: '/account/settings', label: t('account.settings') },
      { href: '/sign-in', label: t('auth.signIn') },
      { href: '/sign-up', label: t('auth.signUp') },
    ],
  },
];

const DEFAULT_KNOWLEDGE_BASE_HEADING = 'knowledge base';

const columnHeading = (
  heading: string,
  knowledgeBase: KnowledgeBaseName,
  t: Translate,
): string =>
  heading.trim().toLowerCase() === DEFAULT_KNOWLEDGE_BASE_HEADING
    ? knowledgeBase.title
    : savedLabel(heading, t);

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

export const SiteFooter = async ({
  title,
  knowledgeBaseEnabled,
  knowledgeBase,
  ticketsEnabled,
  footer,
}: {
  title: string;
  knowledgeBaseEnabled: boolean;
  knowledgeBase: KnowledgeBaseName;
  ticketsEnabled: boolean;
  footer: PortalFooterView;
}) => {
  const t = await getT();
  const year = new Date().getFullYear();

  const columns: FooterColumn[] = footer.columns.length
    ? footer.columns.map((column) => ({
        heading: columnHeading(column.heading, knowledgeBase, t),
        links: column.links.map((link) => ({
          href: link.url,
          label: savedLabel(link.label, t),
        })),
      }))
    : builtInColumns(knowledgeBaseEnabled, knowledgeBase, ticketsEnabled, t);

  const description =
    footer.description ||
    t('footer.description', {
      title,
      brand: site.brand,
      kb: knowledgeBase.inline,
    });

  const copyright = footer.copyright
    ? footer.copyright.replaceAll('{year}', String(year))
    : t('footer.copyright', { year, brand: site.brand });

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
          <LanguageSwitcher className="-mx-2 self-start sm:self-auto" />
        </Container>
      </div>
    </footer>
  );
};
