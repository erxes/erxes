import bwipjs from 'bwip-js';

export const generateBarcodeSvg = (value: string): string => {
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

    return svg.replace('<svg ', '<svg width="150" height="50" ');
  } catch {
    return '';
  }
};
