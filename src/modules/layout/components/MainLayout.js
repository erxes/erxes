import React from 'react';
import { withRouter } from 'react-router';
import PropTypes from 'prop-types';
import { Layout } from '../styles';
import Navigation from './Navigation';

const propTypes = {
  history: PropTypes.object,
  currentUser: PropTypes.object,
  content: PropTypes.element
};

class MainLayout extends React.Component {
  getChildContext() {
    return { currentUser: this.props.currentUser };
  }

  componentDidMount() {
    const { history, currentUser } = this.props;

    if (!currentUser) {
      history.push('/sign-in');
    }
  }

  render() {
    const { content } = this.props;

    return (
      <Layout>
        <Navigation />
        {content}
      </Layout>
    );
  }
}

MainLayout.propTypes = propTypes;

MainLayout.childContextTypes = {
  currentUser: PropTypes.object
};

export default withRouter(MainLayout);
