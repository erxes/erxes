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
  constructor(props) {
    super(props);

    this.can = this.can.bind(this);
  }

  getChildContext() {
    return {
      currentUser: this.props.currentUser,
      can: this.can
    };
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
  }

  can(actionName) {
    const { currentUser } = this.props;

    if (currentUser.isOwner) return true;

    if (!actionName) return false;

    const actions = currentUser.permissionActions || [];

    return actions.indexOf(actionName) >= 0;
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
  currentUser: PropTypes.object,
  can: PropTypes.func
};

export default withRouter(MainLayout);
