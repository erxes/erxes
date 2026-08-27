import type { ReactNode } from 'react';
import { getPortalIdentity } from '../api';
import { SiteFooter } from './SiteFooter';
import { SiteHeader } from './SiteHeader';

export const SiteShell = async ({ children }: { children: ReactNode }) => {
  const { title } = await getPortalIdentity();

  return (
    <>
      <SiteHeader title={title} />
      <main className="flex flex-1 flex-col">{children}</main>
      <SiteFooter title={title} />
    </>
  );
};
