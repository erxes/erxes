import { ICON_AND_COLOR_TABLE } from './constants';

export const getIconAndColor = contentType => {
  return ICON_AND_COLOR_TABLE[contentType];
};

// uppercase and clean text for tooltip
export const formatText = text => {
  return text.replace('nylas-', '').replace(/^\w/, c => c.toUpperCase());
};
