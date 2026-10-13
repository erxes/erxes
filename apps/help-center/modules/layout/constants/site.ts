import type { IconName } from '@/modules/ui/components/Icon';

export const site = {
  brand: 'erxes',
} as const;

export type NavItem = {
  href: string;
  label: string;
  description: string;
  icon: IconName;
};

export const navItems: NavItem[] = [
  {
    href: '/',
    label: 'Support portal',
    description: 'Home page',
    icon: 'home',
  },
  {
    href: '/knowledge-base',
    label: 'Knowledge base',
    description: 'Categories, policies, and guides',
    icon: 'book',
  },
  {
    href: '/tickets',
    label: 'Tickets',
    description: 'Submit and track tickets',
    icon: 'ticket',
  },
  {
    href: '/forms',
    label: 'Forms',
    description: 'Fill in a ready-made form',
    icon: 'clipboard',
  },
  {
    href: '/announcements',
    label: 'Announcements',
    description: 'New notices and updates',
    icon: 'megaphone',
  },
];
