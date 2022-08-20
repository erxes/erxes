// check if valid url
export const isValidURL = (url: string) => {
  try {
    return Boolean(new URL(url));
  } catch (e) {
    return false;
  }
};

export const urlify = (text: string) => {
  // validate url except html a tag
  const urlRegex = /(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w-]+)+[\w\-_~:/?#[\]@!&',;=.]+(?![^<>]*>|[^"]*?<\/a)/g;

  return text.replace(urlRegex, url => {
    if (url.startsWith('http')) {
      return `<a href="${url}" target="_blank">${url}</a>`;
    }

    return `<a href="http://${url}" target="_blank">${url}</a>`;
  });
};

// extract hostname e.g: www.domain.com
const extractHostname = (url: string) => {
  let hostname;

  if (!url) {
    url = '';
  }

  if (url.indexOf('://') > -1) {
    hostname = url.split('/')[2];
  } else {
    hostname = url.split('/')[0];
  }

  hostname = hostname.split(':')[0];
  hostname = hostname.split('?')[0];

  return hostname;
};

// extract root domain e.g: domain.com
const extractRootDomain = (url: string) => {
  let domain = extractHostname(url);
  const splitArr = domain.split('.');
  const arrLen = splitArr.length;

  if (arrLen > 2) {
    domain = splitArr[arrLen - 2] + '.' + splitArr[arrLen - 1];
    if (
      splitArr[arrLen - 1].length === 2 &&
      splitArr[arrLen - 1].length === 2
    ) {
      domain = splitArr[arrLen - 3] + '.' + domain;
    }
  }
  return domain;
};

export default {
  isValidURL,
  extractHostname,
  extractRootDomain
};
