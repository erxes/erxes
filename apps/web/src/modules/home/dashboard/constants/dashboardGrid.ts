import type { TDashboardItem } from '../types/dashboardTypes';

// HomeDashboard's grid-cols-12 auto-rows-10 gap-4 draws the grid these numbers measure.
export const DASHBOARD_GRID_COLUMNS = 12;
export const DASHBOARD_ROW_HEIGHT = 40;
export const DASHBOARD_GRID_GAP = 16;

// Narrower than this the tiles stack in saved order instead of the grid.
export const DASHBOARD_STACK_BELOW_WIDTH = 768;
export const DASHBOARD_MAX_ITEMS = 40;

// What a user sees until they customize; reset brings this back.
export const DASHBOARD_DEFAULT_LAYOUT: TDashboardItem[] = [
  { id: 'default-contacts-overview', type: 'home.contacts-overview', x: 0, y: 0, w: 12, h: 3 },
  { id: 'default-recent-customers', type: 'home.recent-customers', x: 0, y: 3, w: 6, h: 6 },
  { id: 'default-team-members', type: 'home.team-members', x: 6, y: 3, w: 6, h: 6 },
  { id: 'default-plugins', type: 'home.plugins', x: 0, y: 9, w: 12, h: 7 },
  { id: 'default-core', type: 'home.core-modules', x: 0, y: 16, w: 12, h: 6 },
];
