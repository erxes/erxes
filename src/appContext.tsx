import T from 'i18n-react';
import translations from 'locales';
import { IUser } from 'modules/auth/types';
import * as moment from 'moment';
import * as React from 'react';

moment.defineLocale('mn', {
  relativeTime: {
    M: '1 сарын',
    MM: '%d сарын',
    d: '1 өдрийн',
    dd: '%d өдрийн',
    future: '%s дараа',
    h: '1 цагийн',
    hh: '%d цагийн',
    m: 'минутын',
    mm: '%d минутын',
    past: '%s өмнө',
    s: 'саяхан',
    ss: '$d секундын',
    y: '1 жилийн',
    yy: '%d жилийн'
  }
});

moment.updateLocale('en', {
  relativeTime: {
    M: 'a month',
    MM: '%d months',
    d: 'a day',
    dd: '%d days',
    future: 'in %s',
    h: 'an hour',
    hh: '%d hours',
    m: 'a minute',
    mm: '%d minutes',
    past: '%s ago',
    s: '%d seconds',
    ss: '%d s',
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

export class AppProvider extends React.Component<
  { currentUser?: IUser },
  IState
> {
  constructor(props) {
    super(props);

    // initiliaze locale ======
    const currentLanguage = localStorage.getItem('currentLanguage') || 'en';

    this.state = {
      currentLanguage,
      currentUser: props.currentUser
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
          changeLanguage: this.changeLanguage,
          currentLanguage,
          currentUser
        }}
      >
        {this.props.children}
      </AppContext.Provider>
    );
  }
}
