import { navItems, type NavItem } from '../constants/site';

export type NavVisibility = {
  knowledgeBaseEnabled: boolean;
  knowledgeBaseLabel: string;
  ticketsEnabled: boolean;
  ticketLabel: string;
};

export const visibleNavItems = ({
  knowledgeBaseEnabled,
  knowledgeBaseLabel,
  ticketsEnabled,
  ticketLabel,
}: NavVisibility): NavItem[] =>
  navItems
    .filter((item) => {
      if (item.href === '/knowledge-base') {
        return knowledgeBaseEnabled;
      }

      if (item.href === '/tickets') {
        return ticketsEnabled;
      }

      return true;
    })
    .map((item) => {
      if (item.href === '/knowledge-base' && knowledgeBaseLabel) {
        return { ...item, label: knowledgeBaseLabel };
      }

      if (item.href === '/tickets' && ticketLabel) {
        return { ...item, label: ticketLabel };
      }

      return item;
    });
