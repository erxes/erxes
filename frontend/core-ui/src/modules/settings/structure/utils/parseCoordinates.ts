import { TLatLng } from '../types/structureLocation';

const NUMBER = String.raw`(-?\d+(?:\.\d+)?)`;

// Most precise source first: a Google place pin beats its viewport centre
const PATTERNS = [
  new RegExp(`!3d${NUMBER}!4d${NUMBER}`),
  new RegExp(`[?&](?:q|query|ll|destination)=${NUMBER},\\s*${NUMBER}`),
  new RegExp(`@${NUMBER},${NUMBER}`),
  new RegExp(`mlat=${NUMBER}&mlon=${NUMBER}`),
  new RegExp(`#map=\\d+/${NUMBER}/${NUMBER}`),
  new RegExp(`^\\s*${NUMBER}\\s*[,\\s]\\s*${NUMBER}\\s*$`),
];

export const isValidLatLng = (lat: number, lng: number) =>
  Number.isFinite(lat) &&
  Number.isFinite(lng) &&
  Math.abs(lat) <= 90 &&
  Math.abs(lng) <= 180;

const safeDecode = (text: string) => {
  try {
    return decodeURIComponent(text);
  } catch {
    return text;
  }
};

export const parseCoordinates = (text: string): TLatLng | null => {
  const decoded = safeDecode(text.trim());

  for (const pattern of PATTERNS) {
    const match = decoded.match(pattern);
    const lat = Number(match?.[1]);
    const lng = Number(match?.[2]);

    if (match && isValidLatLng(lat, lng)) {
      return { lat, lng };
    }
  }

  return null;
};

// Short links only resolve through a redirect the browser can't read cross-origin
export const isShortMapLink = (text: string) =>
  /maps\.app\.goo\.gl|goo\.gl\/maps/.test(text);
