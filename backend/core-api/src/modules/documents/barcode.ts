import bwipjs from 'bwip-js';

export const generateBarcodeSvg = (
  value: string,
  { width = 150, height = 50 } = {},
): string => {
  if (!value) {
    return '';
  }

  try {
    const svg = bwipjs.toSVG({
      bcid: 'code128',
      text: value,
      height: 12,
      includetext: false,
      paddingwidth: 0,
      paddingheight: 0,
    });

    return svg.replace('<svg ', `<svg width="${width}" height="${height}" `);
  } catch {
    return '';
  }
};
