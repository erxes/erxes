import moment from 'moment';
import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, IntlProvider, addLocaleData } from 'react-intl';
import { withCurrentUser } from 'modules/auth/containers';
import { MainLayout } from '../components';
import translations from '../../../locales';
import en from 'react-intl/locale-data/en';
import mn from 'react-intl/locale-data/mn';

addLocaleData([...en, ...mn]);

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
    yy: '%d жилийн'
  }
});

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
    yy: '%d y'
  }
});

// load translation messages
const messages = {
  ...translations
};

class TranslationWrapper extends React.Component {
  getChildContext() {
    const { intl } = this.props;
    const { formatMessage } = intl;

    return {
      __: msg => formatMessage({ id: msg })
    };
  }

  render() {
    const { children } = this.props;
    return <React.Fragment>{children}</React.Fragment>;
  }
}

TranslationWrapper.propTypes = {
  intl: PropTypes.object,
  children: PropTypes.object
};

TranslationWrapper.childContextTypes = {
  __: PropTypes.func
};

const InjectedComponent = injectIntl(TranslationWrapper);

class MainLayoutContainer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      currentLanguage: 'en',
      messages: messages['en']
    };

    this.changeLanguage = this.changeLanguage.bind(this);
  }

  getChildContext() {
    return {
      changeLanguage: this.changeLanguage,
      currentLanguage: this.state.currentLanguage
    };
  }

  componentDidMount() {
    this.changeLanguage(localStorage.getItem('currentLanguage'));
  }

  changeLanguage(languageCode) {
    const currentLanguage = languageCode || 'en';

    localStorage.setItem('currentLanguage', currentLanguage);

    moment.locale(currentLanguage);

    this.setState({
      currentLanguage,
      messages: messages[currentLanguage]
    });
  }

  render() {
    const { currentLanguage, messages } = this.state;

    return (
      <IntlProvider locale={currentLanguage} messages={messages}>
        <InjectedComponent>
          <MainLayout {...this.props} />
        </InjectedComponent>
      </IntlProvider>
    );
  }
}

MainLayoutContainer.childContextTypes = {
  changeLanguage: PropTypes.func,
  currentLanguage: PropTypes.string
};

export default withCurrentUser(MainLayoutContainer);
