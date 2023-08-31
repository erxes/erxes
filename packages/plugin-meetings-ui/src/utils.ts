import { colors } from '@erxes/ui/src/styles';

const colorList = [
  colors.colorPrimary,
  colors.colorSecondary,
  colors.colorCoreRed,
  colors.colorCoreTeal,
  colors.colorCoreYellow,
  colors.colorCoreOrange,
  colors.colorCoreGreen,
  colors.colorCoreBlue,
  colors.colorCoreSunYellow,
  colors.bgLightPurple,
  colors.socialFacebook,
  colors.socialFacebookMessenger
];

export const generateColorCode = (userId: string) => {
  const hash = userId.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + (acc << 6) + (acc << 16) - acc;
  }, 0);

  // Use modulo to ensure the index is within the bounds of the color list
  const index = Math.abs(hash) % colorList.length;

  // Return the color from the list
  return colorList[index];
};
