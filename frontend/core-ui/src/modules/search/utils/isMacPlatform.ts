export const isMacPlatform = () =>
  typeof navigator !== 'undefined' &&
  /Macintosh|Mac OS X|iPod|iPhone|iPad/i.test(navigator.userAgent);
