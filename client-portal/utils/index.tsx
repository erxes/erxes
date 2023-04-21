import T from 'i18n-react';

export const __ = (key: string, options?: any) => {
  const translation = T.translate(key, options);

  if (!translation) {
    return '';
  }

  return translation.toString();
};

export const setLocale = (currentLanguage, callback) => {
  import(`./locales/${currentLanguage}.json`)
    .then((data) => {
      const translations = data.default;
      T.setTexts(translations);

      // tslint:disable-next-line:no-unused-expression
      callback && callback();
    })
    .catch((e) => console.log(e)); // tslint:disable-line
};

export const prefixer = (url) => {
  if (process.env.NODE_ENV !== 'production') {
    return url;
  }

  return `/${url}`;
};

export const regex = (content) => {
  if (!content) {
    return null;
  }

  return content.replace(/&amp;#8221;/gi, '"');
};

export const getLangParam = () =>
  typeof window !== 'undefined' && window.location.href.indexOf('=mn') > -1
    ? 'mn'
    : 'en';

export const getGoogleUrl = (from, config) => {
  const rootUrl = `https://accounts.google.com/o/oauth2/v2/auth`;
  const options = {
    redirect_uri: 'http://localhost:4200/verify',
    client_id: config.googleClientId || '',
    access_type: 'offline',
    response_type: 'code',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ].join(' '),
    state: from
  };

  const qs = new URLSearchParams(options);

  return `${rootUrl}?${qs.toString()}`;
};

export const generateTree = (
  list,
  parentId,
  callback,
  level = -1,
  parentKey = 'parentId'
) => {
  const filtered = list.filter((c) => c[parentKey] === parentId);

  if (filtered.length > 0) {
    level++;
  } else {
    level--;
  }

  return filtered.reduce((tree, node) => {
    return [
      ...tree,
      callback(node, level),
      ...generateTree(list, node._id, callback, level, parentKey)
    ];
  }, []);
};
