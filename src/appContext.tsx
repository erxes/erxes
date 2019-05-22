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
  isLoading: boolean;
  isRemovingImport: boolean;
}

interface IStore extends IState {
  currentUser?: IUser;
  changeLanguage: (languageCode: string) => void;
  closeLoadingBar: () => void;
  showLoadingBar: (isRemovingImport: boolean) => void;
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
      isLoading: false,
      isRemovingImport: false
    };

    this.setLocale(currentLanguage);
  }

  checkIsLoadingData = () => {
    const lastImport = localStorage.getItem('erxes_import_data');
    const type = localStorage.getItem('erxes_import_data_type');
    const isRemovingImport = type === 'remove' ? true : false;

    if (lastImport) {
      return this.setState({ isLoading: true, isRemovingImport });
    }

    return this.setState({ isLoading: false, isRemovingImport: false });
  };

  closeLoadingBar = () => {
    this.setState({ isLoading: false });

    localStorage.setItem('erxes_import_data', '');
    localStorage.setItem('erxes_import_data_type', '');
  };

  showLoadingBar = (isRemovingImport: boolean) => {
    this.setState({ isLoading: true, isRemovingImport });
  };

  componentDidMount() {
    this.checkIsLoadingData();
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
    const {
      currentUser,
      currentLanguage,
      isLoading,
      isRemovingImport
    } = this.state;

    return (
      <AppContext.Provider
        value={{
          currentUser,
          currentLanguage,
          changeLanguage: this.changeLanguage,
          closeLoadingBar: this.closeLoadingBar,
          showLoadingBar: this.showLoadingBar,
          isLoading,
          isRemovingImport
        }}
      >
        {this.props.children}
      </AppContext.Provider>
    );
  }
}
