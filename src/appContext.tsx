import dayjs from 'dayjs';
import T from 'i18n-react';
import { IUser } from 'modules/auth/types';
import React from 'react';

interface IState {
  currentUser?: IUser;
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

    import(`./locales/${currentLanguage}.json`)
      .then(data => {
        const translations = data.default;
        T.setTexts(translations);
      })
      .catch(e => console.log(e)); // tslint:disable-line
  };

  changeLanguage = (languageCode): void => {
    const currentLanguage = languageCode || 'en';

    if (currentLanguage !== languageCode) {
      localStorage.setItem('currentLanguage', currentLanguage);
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
