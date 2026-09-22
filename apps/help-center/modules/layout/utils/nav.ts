import { navItems, type NavItem } from '../constants/site';

export type NavVisibility = {
  knowledgeBaseEnabled: boolean;
  knowledgeBaseLabel: string;
  ticketsEnabled: boolean;
  ticketLabel: string;
  homeLabel: string;
  formsLabel: string;
  announcementsLabel: string;
};

const labelOverrides = (visibility: NavVisibility): Record<string, string> => ({
  '/': visibility.homeLabel,
  '/knowledge-base': visibility.knowledgeBaseLabel,
  '/tickets': visibility.ticketLabel,
  '/forms': visibility.formsLabel,
  '/announcements': visibility.announcementsLabel,
});

export const visibleNavItems = (visibility: NavVisibility): NavItem[] => {
  const overrides = labelOverrides(visibility);

  return navItems
    .filter((item) => {
      if (item.href === '/knowledge-base') {
        return visibility.knowledgeBaseEnabled;
      }

      if (item.href === '/tickets') {
        return visibility.ticketsEnabled;
      }

      return true;
    })
    .map((item) => {
      const label = overrides[item.href];

      return label ? { ...item, label } : item;
    });
};
