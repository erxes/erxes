import type { IconName } from '@/modules/ui/Icon';

/** Chrome copy that has no CMS/knowledge base source. */
export const site = {
  brand: 'erxes',
  fallbackTitle: 'Мэдлэгийн сан',
  fallbackHeadline:
    'Хайж буй хариултаа мэдлэгийн сангаас олоорой. Олдохгүй бол дэмжлэгийн багт хандаарай.',
  searchPlaceholder: 'Search for articles...',
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
    label: 'Дэмжлэгийн портал',
    description: 'Нүүр хуудас',
    icon: 'home',
  },
  {
    href: '/knowledge-base',
    label: 'Мэдлэгийн сан',
    description: 'Ангилал, бодлого, зааврууд',
    icon: 'book',
  },
  {
    href: '/tickets',
    label: 'Хүсэлт',
    description: 'Хүсэлт илгээх, хянах',
    icon: 'ticket',
  },
  {
    href: '/announcements',
    label: 'Мэдээ мэдээлэл',
    description: 'Шинэ зарлал, шинэчлэлт',
    icon: 'megaphone',
  },
];
