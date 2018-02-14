import React from 'react';
import moment from 'moment';
import { withRouter } from 'react-router';
import PropTypes from 'prop-types';
import { Layout } from '../styles';
import { Navigation } from '../containers';

const propTypes = {
  history: PropTypes.object,
  currentUser: PropTypes.object,
  children: PropTypes.node
};

class MainLayout extends React.Component {
  getChildContext() {
    return { currentUser: this.props.currentUser };
  }

  componentWillMount() {
    moment.updateLocale('en', {
      relativeTime: {
        future: 'in %s',
        past: '%s ',
        s: 'just now',
        m: 'a min',
        mm: '%d m',
        h: 'h',
        hh: '%d h',
        d: 'd',
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
  }

  render() {
    const { children, currentUser } = this.props;

    return (
      <Layout>
        {currentUser && <Navigation />}
        {children}
      </Layout>
    );
  }
}

MainLayout.propTypes = propTypes;

MainLayout.childContextTypes = {
  currentUser: PropTypes.object
};

export default withRouter(MainLayout);
