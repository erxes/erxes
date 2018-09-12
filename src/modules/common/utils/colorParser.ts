const hexToRgb = hex => {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;

  hex = hex.replace(shorthandRegex, (m, r, g, b) => {
    return r + r + g + g + b + b;
  });

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      }
    : null;
};

// returns true if color is light
const isColorLight = hex => {
  let luminance = 0;

  if (hex) {
    const { r, g, b } = hexToRgb(hex);

    const C = [r / 255, g / 255, b / 255];

    for (let i = 0; i < C.length; ++i) {
      C[i] <= 0.03928
        ? (C[i] = C[i] / 12.92)
        : (C[i] = Math.pow((C[i] + 0.055) / 1.055, 2.4));
    }

    luminance = 0.2126 * C[0] + 0.7152 * C[1] + 0.0722 * C[2];
  }

  return luminance > 0.179;
};

export default {
  hexToRgb,
  isColorLight
};
