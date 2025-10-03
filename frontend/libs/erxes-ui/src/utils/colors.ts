export const stringToHslColor = (
  str: string,
  saturation: number,
  lightness: number,
) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const h = hash % 360;
  return `hsl(${h}, ${saturation}%, ${lightness}%)`;
};

export function hexToHsl(hex?: string) {
  // Validate hex format
  if (!hex || !/^#[0-9A-Fa-f]+$/.test(hex)) {
    return;
  }

  // Remove the hash if present
  hex = hex.replace(/^#/, '');

  // Handle 3-digit hex codes by expanding them
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map((char) => char + char)
      .join('');
  }

  // Parse RGB values
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  // Find min and max values
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;

  // Calculate lightness
  const l = (max + min) / 2;

  let h = 0;
  let s = 0;

  if (diff === 0) {
    // Achromatic (gray)
    h = s = 0;
  } else {
    // Calculate saturation
    s = l > 0.5 ? diff / (2 - max - min) : diff / (max + min);

    // Calculate hue
    switch (max) {
      case r:
        h = (g - b) / diff + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / diff + 2;
        break;
      case b:
        h = (r - g) / diff + 4;
        break;
      default:
        h = 0;
        break;
    }
    h /= 6;
  }

  // Convert to degrees and percentages
  h = Math.round(h * 360);
  s = Math.round(s * 100);
  const lightness = Math.round(l * 100);

  return `${h} ${s}% ${lightness}%`;
}
