import T from 'i18n-react';
import translations from 'locales';
import { IUser } from 'modules/auth/types';
import moment from 'moment';
import * as React from 'react';

moment.defineLocale('mn', {
  relativeTime: {
    future: '%s дараа',
    past: '%s өмнө',
    ss: "$d секундын",
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
    yy: '%d жилийн'
  }
});

moment.updateLocale('en', {
  relativeTime: {
    future: 'in %s',
    past: '%s ago',
    s: '%d seconds',
    ss: "%d s",
    m: 'a minute',
    mm: '%d minutes',
    h: 'an hour',
    hh: '%d hours',
    d: 'a day',
    dd: '%d days',
    M: 'a month',
    MM: '%d months',
    y: 'a year',
    yy: '%d years'
  }
});

interface IState {
  currentUser?: IUser;
  currentLanguage: string;
}

interface IStore extends IState {
  currentUser?: IUser;
  changeLanguage: (languageCode: string) => void;
}

const AppContext = React.createContext({} as IStore);

export const AppConsumer = AppContext.Consumer;

export class AppProvider extends React.Component<{ currentUser?: IUser }, IState> {
  constructor(props) {
    super(props);

    // initiliaze locale ======
    const currentLanguage = localStorage.getItem('currentLanguage') || 'en';

    this.state = {
      currentUser: props.currentUser,
      currentLanguage,
    };

    this.setLocale = this.setLocale.bind(this);
    this.changeLanguage = this.changeLanguage.bind(this);

    this.setLocale(currentLanguage);
  }

  setLocale(currentLanguage) {
    moment.locale(currentLanguage);
    T.setTexts(translations[currentLanguage]);
  }

  changeLanguage(languageCode) {
    const currentLanguage = languageCode || 'en';

    localStorage.setItem('currentLanguage', currentLanguage);

    this.setLocale(currentLanguage);

    this.setState({ currentLanguage });
  }

  public render() {
    const { currentUser, currentLanguage } = this.state;

    return (
      <AppContext.Provider
        value={{
          currentUser,
          currentLanguage,
          changeLanguage: this.changeLanguage,
        }}
      >
        {this.props.children}
      </AppContext.Provider>
    );
  }
}