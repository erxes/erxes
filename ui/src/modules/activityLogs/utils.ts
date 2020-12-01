import { ICON_AND_COLOR_TABLE } from './constants';

export const getIconAndColor = contentType => {
  const iconAndColor = ICON_AND_COLOR_TABLE[contentType];

  if (!iconAndColor) {
    return {
      icon: 'focus-add',
      color: '#8c7ae6'
    };
  }

  return iconAndColor;
};

export const capitalize = (text: string) => {
  return text.replace(/^\w/, c => c.toUpperCase());
};

// uppercase and clean text for tooltip
export const formatText = (text: string, noCaseChange?: boolean) => {
  const cleanText = text.replace('nylas-', '').replace('smooch-', '');

  if (noCaseChange) {
    return cleanText;
  }

  return capitalize(cleanText);
};
