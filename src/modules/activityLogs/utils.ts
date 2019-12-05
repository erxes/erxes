import { ICON_AND_COLOR_TABLE } from './constants';

export const getIconAndColor = contentType => {
  return ICON_AND_COLOR_TABLE[contentType];
};
