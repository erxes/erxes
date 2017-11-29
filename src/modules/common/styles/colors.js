import { rgba } from './color';

// Core colors
const colorPrimary = '#A389D4';
const colorSecondary = '#04A9F5';
const colorCoreRed = '#F44236';
const colorCoreYellow = '#F5C22B';
const colorCoreGreen = '#67C682';
const colorCoreBlack = '#393C40';
const colorCoreGray = '#888';
const colorCoreLightGray = '#AAAEB3';
const colorLightGray = '#AAA';
const colorCoreDarkGray = '#333';
const colorBlack = '#000';
const colorShadowGray = '#DDD';

const colorWhite = '#FFF';

// backgrounds
const bgMain = '#EDF1F5';
const bgDark = rgba('#000', 0.95);
const bgLight = '#FAFAFA';
const bgActive = '#EEE';
const bgUnread = '#F6F8FB';
const bgInternal = '#FFFCCC';

// Link colors
const linkPrimary = '#297cbb';
const linkPrimaryHover = rgba(linkPrimary, 0.7);

// Border colors
const borderPrimary = '#EEE';

// Text colors
const textPrimary = '#444';
const textSecondary = rgba(textPrimary, 0.8);
const textOverlay = '#fff';

// Shadow colors
const shadowPrimary = rgba(colorShadowGray, 0.7);
const darkShadow = rgba(colorBlack, 0.2);

// Social colors
const socialFacebook = '#3a5999';
const socialFacebookMessenger = '#1472fb';
const socialTwitter = '#1da1f2';

export default {
  colorPrimary,
  colorSecondary,
  colorCoreRed,
  colorCoreYellow,
  colorCoreGreen,
  colorCoreBlack,
  colorCoreGray,
  colorCoreLightGray,
  colorWhite,
  colorBlack,
  colorShadowGray,
  colorLightGray,
  colorCoreDarkGray,

  bgMain,
  bgDark,
  bgLight,
  bgActive,
  bgUnread,
  bgInternal,

  linkPrimary,
  linkPrimaryHover,

  borderPrimary,

  textPrimary,
  textSecondary,
  textOverlay,

  shadowPrimary,
  darkShadow,

  socialFacebook,
  socialFacebookMessenger,
  socialTwitter
};
