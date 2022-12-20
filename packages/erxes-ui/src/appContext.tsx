import dayjs from 'dayjs';
import T from 'i18n-react';
import { IUser } from './auth/types';
import React from 'react';

interface IState {
  currentUser?: IUser;
  plugins?;
  isLoadedLocale?: boolean;
  currentLanguage: string;
  isShownIndicator: boolean;
  isRemovingImport: boolean;
  isDoneIndicatorAction: boolean;
}

interface IStore extends IState {
  currentUser?: IUser;
  changeLanguage: (languageCode: string) => void;
  closeLoadingBar: () => void;
  doneIndicatorAction: () => void;
  showLoadingBar: (isRemovingImport: boolean) => void;
}

const AppContext = React.createContext({} as IStore);

export const AppConsumer = AppContext.Consumer;

export class AppProvider extends React.Component<
  { currentUser?: IUser; plugins? },
  IState
> {
  constructor(props) {
    super(props);

    // initiliaze locale ======
    const currentLanguage = localStorage.getItem('currentLanguage') || 'en';

    this.state = {
      currentUser: props.currentUser,
      currentLanguage,
      isLoadedLocale: false,
      isShownIndicator: false,
      isRemovingImport: false,

      isDoneIndicatorAction: false
    };

    this.setLocale(currentLanguage);
  }

  checkisShownIndicatorData = () => {
    const lastImport = localStorage.getItem('erxes_import_data');
    const type = localStorage.getItem('erxes_import_data_type');
    const isRemovingImport = type === 'remove' ? true : false;

    if (lastImport) {
      return this.setState({ isShownIndicator: true, isRemovingImport });
    }

    return this.setState({ isShownIndicator: false, isRemovingImport: false });
  };

  closeLoadingBar = () => {
    this.setState({ isShownIndicator: false });

    localStorage.setItem('erxes_import_data', '');
    localStorage.setItem('erxes_import_data_type', '');
  };

  showLoadingBar = (isRemovingImport: boolean) => {
    this.setState({
      isDoneIndicatorAction: false,
      isShownIndicator: true,
      isRemovingImport
    });
  };

  doneIndicatorAction = () => {
    this.setState({ isDoneIndicatorAction: true });
  };

  componentDidMount() {
    this.checkisShownIndicatorData();
  }

  setLocale = (currentLanguage: string): void => {
    if (currentLanguage !== 'mn') {
      import(`dayjs/locale/${currentLanguage}`)
        .then(() => dayjs.locale(currentLanguage))
        .catch(_ => dayjs.locale('en'));
    }

    fetch(`/locales/${currentLanguage}.json`)
      .then(res => res.json())
      .catch(() => console.log(`${currentLanguage} translation not found`))
      .then(json => {
        T.setTexts(json);
        this.setState({ isLoadedLocale: true });
      })
      .catch(e => {
        console.log(e);
        this.setState({ isLoadedLocale: true });
      });
  };

  changeLanguage = (languageCode): void => {
    if (this.state.currentLanguage !== languageCode) {
      localStorage.setItem('currentLanguage', languageCode || 'en');
      window.location.reload();
    }
  };

  public render() {
    const {
      currentUser,
      currentLanguage,
      isShownIndicator,
      isRemovingImport,
      isDoneIndicatorAction
    } = this.state;

    return (
      <AppContext.Provider
        value={{
          currentUser,
          plugins: this.props.plugins,
          currentLanguage,
          changeLanguage: this.changeLanguage,
          closeLoadingBar: this.closeLoadingBar,
          showLoadingBar: this.showLoadingBar,
          doneIndicatorAction: this.doneIndicatorAction,
          isShownIndicator,
          isRemovingImport,
          isDoneIndicatorAction
        }}
      >
        {this.props.children}
      </AppContext.Provider>
    );
  }
}
