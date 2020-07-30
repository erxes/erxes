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

// uppercase and clean text for tooltip
export const formatText = text => {
  return text
    .replace('nylas-', '')
    .replace('smooch-', '')
    .replace(/^\w/, c => c.toUpperCase());
};
