import React from 'react';
import moment from 'moment';
import { withRouter } from 'react-router';
import PropTypes from 'prop-types';
import { Layout } from '../styles';
import { Navigation } from '../containers';
import translations from '../../../locales';
import en from 'react-intl/locale-data/en';
import mn from 'react-intl/locale-data/mn';
import { injectIntl, IntlProvider, addLocaleData } from 'react-intl';

const propTypes = {
  history: PropTypes.object,
  currentUser: PropTypes.object,
  selectLang: PropTypes.func,
  locale: PropTypes.string,
  children: PropTypes.node
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
    const { children, currentUser } = this.props;
    return (
      <React.Fragment>
        {currentUser && <Navigation />}
        {children}
      </React.Fragment>
    );
  }
}

TranslationWrapper.propTypes = {
  intl: PropTypes.object,
  children: PropTypes.object,
  currentUser: PropTypes.object
};

TranslationWrapper.childContextTypes = {
  __: PropTypes.func
};

const InjectedComponent = injectIntl(TranslationWrapper);

const messages = {
  ...translations
};

addLocaleData([...en, ...mn]);

class MainLayout extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      locale: 'en',
      messages: messages['en']
    };

    this.selectLang = this.selectLang.bind(this);
  }

  getChildContext() {
    return {
      currentUser: this.props.currentUser,
      selectLang: this.selectLang,
      locale: this.state.locale
    };
  }

  componentWillMount() {
    moment.updateLocale('en', {
      relativeTime: {
        future: 'in %s',
        past: '%s ',
        s: 'just now',
        m: 'a min',
        mm: '%d m',
        h: 'an hour',
        hh: '%d h',
        d: 'a day',
        dd: '%d d',
        M: 'a mth',
        MM: '%d mths',
        y: 'an year',
        yy: '%d y'
      }
    });
  }

  componentDidMount() {
    const { history, currentUser } = this.props;

    if (!currentUser) {
      history.push('/sign-in');
    }

    //browser default form validation event listener
    document.addEventListener(
      'invalid',
      (function() {
        return function(e) {
          //prevent the browser from showing default error hint
          e.preventDefault();

          e.target.classList.add('form-invalid');
        };
      })(),
      true
    );

    this.getLang();
  }

  getLang() {
    const locale = localStorage.getItem('locale');
    this.selectLang(locale);
  }

  selectLang(locale) {
    localStorage.setItem('locale', locale || 'en');
    this.setState({
      locale: locale || 'en',
      messages: messages[locale || 'en']
    });
  }

  render() {
    const { locale, messages } = this.state;

    return (
      <IntlProvider locale={locale} messages={messages}>
        <Layout>
          <InjectedComponent {...this.props} />
        </Layout>
      </IntlProvider>
    );
  }
}

MainLayout.propTypes = propTypes;

MainLayout.childContextTypes = {
  currentUser: PropTypes.object,
  selectLang: PropTypes.func,
  locale: PropTypes.string
};

export default withRouter(MainLayout);
