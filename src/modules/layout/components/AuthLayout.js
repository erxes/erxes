import React from 'react';
import { withRouter } from 'react-router';
import PropTypes from 'prop-types';
import { Authlayout, AuthContent, AuthDescription } from '../styles';
import { Grid, Col } from 'react-bootstrap';

const propTypes = {
  history: PropTypes.object,
  content: PropTypes.element,
  currentUser: PropTypes.object
};

class AuthLayout extends React.Component {
  componentDidMount() {
    const { history, currentUser } = this.props;

    if (currentUser) {
      history.push('/');
    }
  }

  render() {
    const { content } = this.props;
    const { __ } = this.context;

    return (
      <Authlayout>
        <a
          className="go-to-home"
          target="_blank"
          rel="noopener noreferrer"
          href="http://erxes.io/"
        >
          Go to home page
        </a>
        <AuthContent>
          <Grid>
            <Col md={6} mdOffset={3}>
              <AuthDescription>
                <img src="/images/logo.png" alt="erxes" />
                <h1>{__('Customer engagement. Redefined.')}</h1>
                <p>
                  {__(
                    'erxes is an AI meets open source messaging platform for sales and marketing'
                  )}
                </p>
              </AuthDescription>
              {content}
            </Col>
          </Grid>
        </AuthContent>
      </Authlayout>
    );
  }
}

AuthLayout.propTypes = propTypes;
AuthLayout.contextTypes = {
  __: PropTypes.func
};

export default withRouter(AuthLayout);
