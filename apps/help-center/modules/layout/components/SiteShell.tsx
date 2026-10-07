import type { ReactNode } from 'react';
import { getAnnouncements } from '@/modules/cms/api';
import { announcementHref } from '@/modules/cms/utils/format';
import { getPortalForms } from '@/modules/forms/api';
import { getTopicOverview } from '@/modules/knowledge-base/api';
import { knowledgeBaseName } from '@/modules/knowledge-base/utils/label';
import { sectionArticleCount } from '@/modules/knowledge-base/utils/selectors';
import { savedLabel } from '@/modules/i18n/savedLabel';
import { getT } from '@/modules/i18n/server';
import { getPortalIdentity, getPortalSettings } from '../api';
import { AppNav, type NavGroup, type NavLink } from './AppNav';
import { PortalHtml } from './PortalHtml';
import { SiteFooter } from './SiteFooter';

export const SiteShell = async ({ children }: { children: ReactNode }) => {
  const [{ title }, settings, topic, forms, posts, t] = await Promise.all([
    getPortalIdentity(),
    getPortalSettings(),
    getTopicOverview(),
    getPortalForms(),
    getAnnouncements(),
    getT(),
  ]);

  const knowledgeBase = knowledgeBaseName(settings.knowledgeBaseLabel, t);
  const knowledgeBaseLabel = knowledgeBase.title;
  const formsLabel = savedLabel(
    settings.header.formsLabel || t('nav.forms'),
    t,
  );
  const announcementsLabel = savedLabel(
    settings.header.announcementsLabel || t('nav.announcements'),
    t,
  );
  const ticketLabel = savedLabel(settings.ticketLabel || t('nav.tickets'), t);

  const links: NavLink[] = [
    {
      href: '/',
      label: savedLabel(settings.header.homeLabel || t('nav.home'), t),
      icon: 'home',
    },
  ];

  if (settings.knowledgeBaseEnabled) {
    links.push({
      href: '/knowledge-base',
      label: knowledgeBaseLabel,
      icon: 'book',
    });
  }

  if (forms.state === 'ready' && forms.data.length) {
    links.push({
      href: '/forms',
      label: formsLabel,
      icon: 'clipboard',
    });
  }

  links.push({
    href: '/announcements',
    label: announcementsLabel,
    icon: 'megaphone',
  });

  if (settings.ticketsEnabled) {
    links.push({
      href: '/tickets',
      label: ticketLabel,
      icon: 'ticket',
    });
  }

  const groups: NavGroup[] = [];

  if (settings.knowledgeBaseEnabled) {
    groups.push({
      key: 'knowledge-base',
      href: '/knowledge-base',
      label: knowledgeBaseLabel,
      icon: 'book',
      emptyLabel: t('nav.emptyCategories'),
      items:
        topic.state === 'ready'
          ? topic.data.sections.map((section) => ({
              href: section.children.length
                ? `/knowledge-base#section-${section._id}`
                : `/knowledge-base/category/${section._id}`,
              label: section.title,
              count: sectionArticleCount(section),
              children: section.children.map((category) => ({
                href: `/knowledge-base/category/${category._id}`,
                label: category.title,
                count: category.articleCount,
              })),
            }))
          : [],
    });
  }

  if (forms.state === 'ready' && forms.data.length) {
    groups.push({
      key: 'forms',
      href: '/forms',
      label: formsLabel,
      icon: 'clipboard',
      emptyLabel: t('nav.emptyForms'),
      items: forms.data.map((form) => ({
        href: `/forms/${form._id}`,
        label: form.title || form.name || t('nav.form'),
      })),
    });
  }

  groups.push({
    key: 'announcements',
    href: '/announcements',
    label: announcementsLabel,
    icon: 'megaphone',
    emptyLabel: t('nav.emptyAnnouncements'),
    items:
      posts.state === 'ready'
        ? posts.data.map((post) => ({
            href: announcementHref(post),
            label: post.title || t('nav.announcement'),
          }))
        : [],
  });

  if (settings.ticketsEnabled) {
    groups.push({
      key: 'tickets',
      href: '/tickets',
      label: ticketLabel,
      icon: 'ticket',
      emptyLabel: t('nav.emptyTickets'),
      items: [
        { href: '/tickets/new', label: t('tickets.submit') },
        { href: '/tickets/track', label: t('tickets.trackByNumber') },
      ],
    });
  }

  return (
    <>
      <PortalHtml html={settings.theme?.headerHtml ?? null} />

      <AppNav
        title={title}
        logo={settings.theme?.mainLogo ?? null}
        wordmark={settings.header.wordmark}
        links={links}
        groups={groups}
      />

      <div className="flex min-h-full flex-1 flex-col lg:pl-64">
        <main className="flex flex-1 flex-col">{children}</main>
        <SiteFooter
          title={title}
          knowledgeBaseEnabled={settings.knowledgeBaseEnabled}
          knowledgeBase={knowledgeBase}
          ticketsEnabled={settings.ticketsEnabled}
          footer={settings.footer}
        />
      </div>

      <PortalHtml html={settings.theme?.footerHtml ?? null} />
    </>
  );
};
