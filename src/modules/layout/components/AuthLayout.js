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

    return (
      <Authlayout>
        <AuthContent>
          <Grid>
            <Col md={12}>
              <a
                className="go-to-home"
                target="_blank"
                rel="noopener noreferrer"
                href="http://erxes.io/"
              >
                Go to home page
              </a>
              <div className="clearfix" />
            </Col>
            <Col md={6} mdOffset={3}>
              <AuthDescription>
                <h1>Customer engagement. Redefined.</h1>
                <p>
                  erxes is an AI meets open source messaging platform for sales
                  and marketing teams.
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

export default withRouter(AuthLayout);
