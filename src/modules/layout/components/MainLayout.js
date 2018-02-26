import React from 'react';
import moment from 'moment';
import { withRouter } from 'react-router';
import PropTypes from 'prop-types';
import { Layout } from '../styles';
import { Navigation } from '../containers';
import translations from '../../../locales';
import en from 'react-intl/locale-data/en';
import { injectIntl, IntlProvider, addLocaleData } from 'react-intl';

const propTypes = {
  history: PropTypes.object,
  currentUser: PropTypes.object,
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
      <div>
        {currentUser && <Navigation />}
        {children}
      </div>
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
  ...translations.en
};

addLocaleData([...en]);

class MainLayout extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      toggleLang: false,
      locale: 'en',
      messages: messages
    };
  }

  getChildContext() {
    return {
      currentUser: this.props.currentUser,
      toggleLang: this.toggleLang,
      locale: this.state.locale
    };
  }

  componentWillMount() {
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
  }

  componentDidMount() {
    const { history, currentUser } = this.props;

    if (!currentUser) {
      history.push('/sign-in');
    }
  }

  render() {
    const { locale, messages } = this.state;

    return (
      <IntlProvider locale={locale || 'en'} messages={messages}>
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
  toggleLang: PropTypes.func,
  locale: PropTypes.string
};

export default withRouter(MainLayout);
