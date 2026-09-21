import type { IconName } from '@/modules/ui/components/Icon';

const iconMap: Record<string, IconName> = {
  alarm: 'alarm',
  apps: 'grid',
  'bar-chart': 'chart',
  bell: 'bell',
  book: 'book',
  'book-open': 'book',
  briefcase: 'briefcase',
  chart: 'chart',
  'chart-bar': 'chart',
  clipboard: 'clipboard',
  'clipboard-notes': 'clipboard',
  clock: 'clock',
  compass: 'compass',
  diamond: 'diamond',
  earthgrid: 'globe',
  globe: 'globe',
  home: 'home',
  idea: 'bulb',
  lock: 'lock',
  megaphone: 'megaphone',
  paintpalette: 'palette',
  paste: 'paste',
  piechart: 'piechart',
  piggybank: 'piggybank',
  postcard: 'article',
  puzzle: 'puzzle',
  'puzzle-piece': 'puzzle',
  scale: 'scale',
  search: 'search',
  settings: 'settings',
  smile: 'smile',
  star: 'star',
  tag: 'ticket',
  ticket: 'ticket',
  tools: 'wrench',
  umbrella: 'umbrella',
  user: 'users',
  'users-alt': 'users',
};

export const resolveIcon = (icon: string | null | undefined): IconName => {
  if (!icon) {
    return 'article';
  }

  const key = icon
    .trim()
    .toLowerCase()
    .replace(/^icon-/, '');

  return iconMap[key] ?? 'article';
};
