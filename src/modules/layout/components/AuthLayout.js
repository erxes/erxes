import React from 'react';
import { withRouter } from 'react-router';
import PropTypes from 'prop-types';
import { Grid, Col } from 'react-bootstrap';
import { Authlayout, AuthContent, AuthDescription } from '../styles';

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
        <AuthContent>
          <Grid>
            <Col md={7}>
              <AuthDescription>
                <img src="/images/logo.png" alt="erxes" />
                <h1>{__('Customer engagement. REDEFINED.')}</h1>
                <p>
                  {__(
                    'erxes is an AI meets open source messaging platform for sales, marketing and support'
                  )}
                </p>
                <a href="http://erxes.io/">« Go to home page</a>
              </AuthDescription>
            </Col>
            <Col md={5}>{content}</Col>
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
