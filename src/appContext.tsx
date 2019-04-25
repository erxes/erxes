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
  isImporting: boolean;
}

interface IStore extends IState {
  currentUser?: IUser;
  changeLanguage: (languageCode: string) => void;
  closeImportBar: () => void;
  showImportBar: () => void;
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
      currentUser: props.currentUser,
      currentLanguage,
      isImporting: false
    };

    this.setLocale(currentLanguage);
  }

  checkIsImportingData = () => {
    const lastImport = localStorage.getItem('erxes_import_data');

    if (lastImport) {
      return this.setState({ isImporting: true });
    }

    return this.setState({ isImporting: false });
  };

  closeImportBar = () => {
    this.setState({ isImporting: false });

    localStorage.setItem('erxes_import_data', '');
  };

  showImportBar = () => {
    this.setState({ isImporting: true });
  };

  componentDidMount() {
    this.checkIsImportingData();
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
    const { currentUser, currentLanguage, isImporting } = this.state;

    return (
      <AppContext.Provider
        value={{
          currentUser,
          currentLanguage,
          changeLanguage: this.changeLanguage,
          closeImportBar: this.closeImportBar,
          showImportBar: this.showImportBar,
          isImporting
        }}
      >
        {this.props.children}
      </AppContext.Provider>
    );
  }
}
