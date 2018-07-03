import React from 'react';
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
    return {
      currentUser: this.props.currentUser
    };
  }

  componentDidMount() {
    const { history, currentUser } = this.props;

    if (history.location.pathname !== '/reset-password' && !currentUser) {
      history.push('/sign-in');
    }

    // browser default form validation event listener
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
  }

  render() {
    const { currentUser, children } = this.props;

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
