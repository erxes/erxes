export const isViberStorageKey = (key: string): boolean =>
  Boolean(key) &&
  key.length <= 1024 &&
  !key.startsWith('/') &&
  !/[\\:?#%]/.test(key) &&
  Array.from(key).every(
    (character) =>
      character.charCodeAt(0) > 31 && character.charCodeAt(0) !== 127,
  ) &&
  !key.split('/').some((part) => !part || part === '.' || part === '..');

// Core returns Stream manifests; share its hosted player, never fetch the playlist.
export const getViberVideoLink = (source: string): string | null => {
  if (source.length > 1024) return null;
  const match = source.match(
    /^https:\/\/(customer-[a-z0-9-]+\.cloudflarestream\.com)\/([a-f0-9]{32})\/manifest\/video\.(?:m3u8|mpd)$/,
  );
  return match ? `https://${match[1]}/${match[2]}/watch` : null;
};
