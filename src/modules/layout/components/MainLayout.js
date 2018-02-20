import React from 'react';
import moment from 'moment';
import { withRouter } from 'react-router';
import PropTypes from 'prop-types';
import { Layout } from '../styles';
import { Navigation } from '../containers';
import { mnTranslation } from '../../../locales';
import mn from 'react-intl/locale-data/mn';
import en from 'react-intl/locale-data/en';
import TranslationWrapper from './TranslationWrapper';
import { injectIntl, IntlProvider, addLocaleData } from 'react-intl';

const propTypes = {
  history: PropTypes.object,
  currentUser: PropTypes.object,
  toggleLang: PropTypes.func,
  children: PropTypes.node
};

const InjectedComponent = injectIntl(TranslationWrapper);
const mergedMessages = {
  ...mnTranslation.settings
};

addLocaleData([...mn, ...en]);

class MainLayout extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      toggleLang: false,
      locale: '',
      messages: mergedMessages
    };

    this.toggleLang = this.toggleLang.bind(this);
  }

  getChildContext() {
    return {
      currentUser: this.props.currentUser,
      toggleLang: this.toggleLang
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

    this.getLang();
  }

  getLang() {
    const lang = localStorage.getItem('locale');
    const messages = lang === 'mn' ? mergedMessages : {};

    this.setLang(lang || 'en', messages);
  }

  setLang(locale, messages) {
    localStorage.setItem('locale', locale);
    this.setState({ locale, messages });
  }

  toggleLang() {
    this.setState(prevState => ({ toggleLang: !prevState.toggleLang }));
    const { toggleLang } = this.state;

    toggleLang ? this.setLang('mn', mergedMessages) : this.setLang('en', {});
  }

  render() {
    const { currentUser } = this.props;
    const { locale, messages } = this.state;

    return (
      <IntlProvider locale={locale || 'en'} messages={messages}>
        <Layout>
          {currentUser && <Navigation />}
          <InjectedComponent {...this.props} />
        </Layout>
      </IntlProvider>
    );
  }
}

MainLayout.propTypes = propTypes;

MainLayout.childContextTypes = {
  currentUser: PropTypes.object,
  toggleLang: PropTypes.func
};

export default withRouter(MainLayout);
