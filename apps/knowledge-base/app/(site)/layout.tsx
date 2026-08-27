import type { ReactNode } from 'react';
import { SiteShell } from '@/modules/layout/components/SiteShell';

export default function SiteLayout({ children }: { children: ReactNode }) {
  return <SiteShell>{children}</SiteShell>;
}
