import { detect } from 'detect-browser';
import T from 'i18n-react';
import translations from 'locales';
import { IUser } from 'modules/auth/types';
import * as moment from 'moment';
import * as React from 'react';

moment.defineLocale('mn', {
  relativeTime: {
    future: '%s',
    past: '%s',
    ss: '$dс',
    s: 'саяхан',
    m: 'м',
    mm: '%dм',
    h: '1ц',
    hh: '%dц',
    d: '1ө',
    dd: '%dө',
    M: '1с',
    MM: '%dс',
    y: '1ж',
    yy: '%dж'
  }
});

moment.updateLocale('en', {
  relativeTime: {
    future: '%s',
    past: '%s',
    s: '%ds',
    ss: '%ds',
    m: 'm',
    mm: '%dm',
    h: 'h',
    hh: '%dh',
    d: 'd',
    dd: '%dd',
    M: 'm',
    MM: '%dm',
    y: 'y',
    yy: '%dy'
  }
});

interface IState {
  currentUser?: IUser;
  currentLanguage: string;
}

interface IStore extends IState {
  currentUser?: IUser;
  changeLanguage: (languageCode: string) => void;
  browserSupported: boolean;
}

const AppContext = React.createContext({} as IStore);
const browser = detect();

export const AppConsumer = AppContext.Consumer;

export class AppProvider extends React.Component<
  { currentUser?: IUser },
  IState
> {
  constructor(props) {
    super(props);

    // initiliaze locale ======
    const currentLanguage = localStorage.getItem('currentLanguage') || 'en';

    this.state = {
      currentUser: props.currentUser,
      currentLanguage
    };

    this.setLocale(currentLanguage);
  }

  setLocale = (currentLanguage: string): void => {
    moment.locale(currentLanguage);
    T.setTexts(translations[currentLanguage]);
  };

  changeLanguage = (languageCode): void => {
    const currentLanguage = languageCode || 'en';

    localStorage.setItem('currentLanguage', currentLanguage);

    this.setLocale(currentLanguage);

    this.setState({ currentLanguage });
  };

  public render() {
    const { currentUser, currentLanguage } = this.state;

    let browserSupported = true;

    switch (browser && browser.name) {
      case 'chrome':
        if (browser) {
          const version = Number(
            browser.version && browser.version.split('.')[0]
          );
          if (version > 58) {
            break;
          }
        }
      case 'firefox':
        if (browser) {
          const version = Number(
            browser.version && browser.version.split('.')[0]
          );
          if (version > 59) {
            break;
          }
        }
      case 'edge':
        if (browser) {
          const version = Number(
            browser.version && browser.version.split('.')[0]
          );
          if (version > 16) {
            break;
          }
        }
      case 'safari':
        if (browser) {
          const version = Number(
            browser.version && browser.version.split('.')[0]
          );
          if (version > 11) {
            break;
          }
        }

      default:
        browserSupported = false;
    }

    return (
      <AppContext.Provider
        value={{
          currentUser,
          currentLanguage,
          browserSupported,
          changeLanguage: this.changeLanguage
        }}
      >
        {this.props.children}
      </AppContext.Provider>
    );
  }
}
