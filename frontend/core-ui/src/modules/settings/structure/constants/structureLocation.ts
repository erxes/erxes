import { TLatLng } from '../types/structureLocation';

export const OSM_TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
export const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
export const NOMINATIM_SEARCH_URL =
  'https://nominatim.openstreetmap.org/search';

export const WORLD_CENTER: TLatLng = { lat: 20, lng: 0 };
export const WORLD_ZOOM = 2;
export const PLACE_ZOOM = 16;

export const RADIUS_PRESETS = [50, 100, 200, 500, 1000];
export const RADIUS_SLIDER_MAX = 1000;
export const RADIUS_SLIDER_STEP = 10;
