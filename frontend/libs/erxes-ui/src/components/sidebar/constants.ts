export const SIDEBAR_COOKIE_NAME = 'sidebar:state';
export const SIDEBAR_COLLAPSE_COOKIE_NAME = 'sidebar:collapse';
export const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
export const SIDEBAR_WIDTH = '16rem';
export const SIDEBAR_WIDTH_COMPACT = '12rem';
export const SIDEBAR_WIDTH_MOBILE = '18rem';
export const SIDEBAR_WIDTH_ICON = '3rem';
export const SIDEBAR_KEYBOARD_SHORTCUT = 'b';

export type CollapseState = 'expanded' | 'compact' | 'collapsed';

export const COLLAPSE_ORDER: CollapseState[] = [
  'expanded',
  'compact',
  'collapsed',
];

export const nextCollapseState = (prev: CollapseState): CollapseState =>
  COLLAPSE_ORDER[(COLLAPSE_ORDER.indexOf(prev) + 1) % COLLAPSE_ORDER.length];
