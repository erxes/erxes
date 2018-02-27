// check if valid url
const isValidURL = url => {
  var expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi; //eslint-disable-line
  var regex = new RegExp(expression);

  if (!regex.test(url)) {
    return false;
  } else {
    return true;
  }
};

// extract hostname e.g: www.domain.com
const extractHostname = url => {
  let hostname;

  if (!url) url = '';

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
const extractRootDomain = url => {
  let domain = extractHostname(url),
    splitArr = domain.split('.'),
    arrLen = splitArr.length;

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
