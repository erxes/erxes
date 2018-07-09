/* global FileReader */
import moment from 'moment';
import T from 'i18n-react';
import translation from '../locales';

export const getBrowserInfo = async () => {
  let location;

  try {
    const response = await fetch('http://geoip.nekudo.com/api/{ip}/{language}/{type}');

    location = await response.json();
  } catch (e) {
    console.log(e.message); // eslint-disable-line

    location = {
      city: '',
      country: {
        name: '',
        code: ''
      },
      location: {
        accuracy_radius: 1,
        latitude: 0,
        longitude: 0,
        time_zone: ''
      },
      ip: ''
    };
  }

  return {
    remoteAddress: location.ip,
    region: location.region_name,
    city: location.city,
    country: location.country.name,
    url: window.location.pathname, // eslint-disable-line
    hostname: window.location.origin, // eslint-disable-line
    language: navigator.language, // eslint-disable-line
    userAgent: navigator.userAgent, // eslint-disable-line
  };
}

export const postMessage = (source, message, postData={}) => {
  window.parent.postMessage({
    fromErxes: true,
    source,
    message,
    ...postData
  }, '*');
}

export const requestBrowserInfo = ({ source, postData={}, callback }) => {
  postMessage(source, 'requestingBrowserInfo', postData);

  window.addEventListener('message', (event) => {
    const data = event.data || {};
    const { fromPublisher, message, browserInfo } = data;

    if (fromPublisher && source === data.source && message === 'sendingBrowserInfo') {
      callback(browserInfo);
    }
  });
};

export const setMomentLocale = (code) => {
  moment.updateLocale('en', {
    relativeTime: {
      future: 'in %s',
      past: '%s ',
      s: 's',
      m: 'm',
      mm: '%d m',
      h: 'h',
      hh: '%d h',
      d: 'd',
      dd: '%d d',
      M: 'a mth',
      MM: '%d mths',
      y: 'y',
      yy: '%d y',
    },
  });

  moment.defineLocale('mn', {
    relativeTime: {
      future: '%s дараа',
      past: '%s өмнө',
      s: 'саяхан',
      m: 'минутын',
      mm: '%d минутын',
      h: '1 цагийн',
      hh: '%d цагийн',
      d: '1 өдрийн',
      dd: '%d өдрийн',
      M: '1 сарын',
      MM: '%d сарын',
      y: '1 жилийн',
      yy: '%d жилийн',
    },
  });

  moment.locale(code)
}

export const setLocale = (code) => {
  T.setTexts(translation[code || 'en']);

  setMomentLocale(code);
}
