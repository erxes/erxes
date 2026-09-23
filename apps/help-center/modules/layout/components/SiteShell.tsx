import type { ReactNode } from 'react';
import { getPortalForms } from '@/modules/forms/api';
import { getTopicOverview } from '@/modules/knowledge-base/api';
import { sectionArticleCount } from '@/modules/knowledge-base/utils/selectors';
import { getPortalIdentity, getPortalSettings } from '../api';
import { AppNav, type NavLink, type NavSection } from './AppNav';
import { PortalHtml } from './PortalHtml';
import { SiteFooter } from './SiteFooter';

export const SiteShell = async ({ children }: { children: ReactNode }) => {
  const [{ title }, settings, topic, forms] = await Promise.all([
    getPortalIdentity(),
    getPortalSettings(),
    getTopicOverview(),
    getPortalForms(),
  ]);

  const links: NavLink[] = [
    { href: '/', label: settings.header.homeLabel || 'Home', icon: 'home' },
  ];

  if (settings.knowledgeBaseEnabled) {
    links.push({
      href: '/knowledge-base',
      label: settings.knowledgeBaseLabel || 'Knowledge base',
      icon: 'book',
    });
  }

  if (forms.state === 'ready' && forms.data.length) {
    links.push({
      href: '/forms',
      label: settings.header.formsLabel || 'Forms',
      icon: 'clipboard',
    });
  }

  links.push({
    href: '/announcements',
    label: settings.header.announcementsLabel || 'Announcements',
    icon: 'megaphone',
  });

  if (settings.ticketsEnabled) {
    links.push({
      href: '/tickets',
      label: settings.ticketLabel || 'Tickets',
      icon: 'ticket',
    });
  }

  const sections: NavSection[] =
    topic.state === 'ready' && settings.knowledgeBaseEnabled
      ? topic.data.sections.map((section) => ({
          _id: section._id,
          title: section.title,
          href: section.children.length
            ? `/knowledge-base#section-${section._id}`
            : `/knowledge-base/category/${section._id}`,
          articleCount: sectionArticleCount(section),
          categories: section.children.map((category) => ({
            _id: category._id,
            title: category.title,
            articleCount: category.articleCount,
          })),
        }))
      : [];

  return (
    <>
      <PortalHtml html={settings.theme?.headerHtml ?? null} />

      <AppNav
        title={title}
        logo={settings.theme?.mainLogo ?? null}
        wordmark={settings.header.wordmark}
        links={links}
        sections={sections}
      />

      <div className="flex min-h-full flex-1 flex-col lg:pl-64">
        <main className="flex flex-1 flex-col">{children}</main>
        <SiteFooter
          title={title}
          knowledgeBaseEnabled={settings.knowledgeBaseEnabled}
          ticketsEnabled={settings.ticketsEnabled}
          footer={settings.footer}
        />
      </div>

      <PortalHtml html={settings.theme?.footerHtml ?? null} />
    </>
  );
};
