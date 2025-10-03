import { REACT_APP_API_URL, REACT_APP_IMAGE_CDN_URL } from 'erxes-ui/utils';
import { isValidURL } from 'erxes-ui/utils/urlParser';

export const readImage = (
  value?: string,
  width?: number,
  inline?: boolean,
  format?: string,
  quality?: number,
): string => {
  if (
    !value ||
    isValidURL(value) ||
    (typeof value === 'string' && value.includes('http')) ||
    (typeof value === 'string' && value.startsWith('/'))
  ) {
    return value || '';
  }

  if (REACT_APP_IMAGE_CDN_URL) {
    let url = `${REACT_APP_IMAGE_CDN_URL}/width=${width || 500}`;

    url += format ? `,format=${format}` : '';
    url += quality ? `,quality=${quality}` : '';

    return `${url}/${REACT_APP_API_URL}/read-file?key=${encodeURIComponent(
      value,
    )}`;
  }

  let url = `${REACT_APP_API_URL}/read-file?key=${encodeURIComponent(value)}`;

  if (width) {
    url += `&width=${width}`;
  }

  if (inline) {
    url += `&inline=${inline}`;
  }

  if (format) {
    url += `&format=${format}`;
  }

  return url;
};
