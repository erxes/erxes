import { TDashboardItem } from '@/home/dashboard/types/dashboardTypes';

export const DASHBOARD_GRID_COLUMNS = 12;
export const DASHBOARD_ROW_HEIGHT = 40;
export const DASHBOARD_GRID_GAP = 16;
// Narrower than this the tiles stack in saved order instead of the grid.
export const DASHBOARD_STACK_BELOW_WIDTH = 768;
// Matches the backend limit on a saved layout.
export const DASHBOARD_MAX_ITEMS = 40;

// What a user sees until they customize; reset brings this back.
export const DASHBOARD_DEFAULT_LAYOUT: TDashboardItem[] = [
  {
    id: 'default-notifications',
    type: 'home.notifications',
    x: 0,
    y: 0,
    w: 6,
    h: 6,
  },
  { id: 'default-starred', type: 'home.starred', x: 6, y: 0, w: 6, h: 6 },
  { id: 'default-plugins', type: 'home.plugins', x: 0, y: 6, w: 12, h: 7 },
  { id: 'default-core', type: 'home.core-modules', x: 0, y: 13, w: 12, h: 6 },
];
