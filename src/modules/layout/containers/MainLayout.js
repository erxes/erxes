import moment from 'moment';
import T from 'i18n-react';
import React from 'react';
import PropTypes from 'prop-types';
import { withCurrentUser } from 'modules/auth/containers';
import { MainLayout } from '../components';
import translations from '../../../locales';

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
    past: '%s ago',
    s: '%d seconds',
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

class TranslationWrapper extends React.Component {
  getChildContext() {
    return {
      __: msg => T.translate(msg)
    };
  }

  render() {
    const { children } = this.props;
    return <React.Fragment>{children}</React.Fragment>;
  }
}

TranslationWrapper.propTypes = {
  children: PropTypes.object
};

TranslationWrapper.childContextTypes = {
  __: PropTypes.func
};

class MainLayoutContainer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      currentLanguage: 'en'
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

    T.setTexts(translations[currentLanguage]);

    this.setState({ currentLanguage });
  }

  render() {
    return (
      <TranslationWrapper>
        <MainLayout {...this.props} />
      </TranslationWrapper>
    );
  }
}

MainLayoutContainer.childContextTypes = {
  changeLanguage: PropTypes.func,
  currentLanguage: PropTypes.string
};

export default withCurrentUser(MainLayoutContainer);
