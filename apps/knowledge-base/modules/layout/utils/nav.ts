import { navItems, type NavItem } from '../constants/site';

export type NavVisibility = {
  knowledgeBaseEnabled: boolean;
  knowledgeBaseLabel: string;
  ticketsEnabled: boolean;
  ticketLabel: string;
};

/**
 * Drops the destinations the help center turned off and applies the labels it
 * chose for the two features it names. The home page is never dropped: it is
 * the portal's own entry point rather than one of the toggled features.
 */
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
