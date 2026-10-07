const EXTERNAL_SOURCE = /^(?:[a-z][a-z0-9+.-]*:|\/)/i;

export const storageImageSources = (html: string) => {
  if (!html) {
    return [];
  }

  const doc = new DOMParser().parseFromString(html, 'text/html');

  return Array.from(doc.querySelectorAll('img'))
    .map((image) => (image.getAttribute('src') ?? '').trim())
    .filter((source) => source && !EXTERNAL_SOURCE.test(source));
};
