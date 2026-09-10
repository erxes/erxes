import type { ReactNode } from 'react';
import { getPortalIdentity, getPortalSettings } from '../api';
import { PortalHtml } from './PortalHtml';
import { SiteFooter } from './SiteFooter';
import { SiteHeader } from './SiteHeader';

export const SiteShell = async ({ children }: { children: ReactNode }) => {
  const [{ title }, settings] = await Promise.all([
    getPortalIdentity(),
    getPortalSettings(),
  ]);

  return (
    <>
      <PortalHtml html={settings.theme?.headerHtml ?? null} />
      <SiteHeader
        title={title}
        logo={settings.theme?.mainLogo ?? null}
        knowledgeBaseEnabled={settings.knowledgeBaseEnabled}
        knowledgeBaseLabel={settings.knowledgeBaseLabel}
        ticketsEnabled={settings.ticketsEnabled}
        ticketLabel={settings.ticketLabel}
      />
      <main className="flex flex-1 flex-col">{children}</main>
      <SiteFooter
        title={title}
        knowledgeBaseEnabled={settings.knowledgeBaseEnabled}
        ticketsEnabled={settings.ticketsEnabled}
      />
      <PortalHtml html={settings.theme?.footerHtml ?? null} />
    </>
  );
};
