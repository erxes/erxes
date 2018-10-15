import { __ } from 'modules/common/utils';
import * as React from 'react';
import { Col, Grid } from 'react-bootstrap';
import { AuthContent, AuthDescription, Authlayout } from '../styles';

type Props = {
  content: React.ReactNode;
};

class AuthLayout extends React.Component<Props, {}> {
  render() {
    const { content } = this.props;

    return (
      <Authlayout>
        <AuthContent>
          <Grid>
            <Col md={6}>
              <AuthDescription>
                <img src="/images/logo.png" alt="erxes" />
                <h1>Open Source Growth Marketing Platform</h1>
                <p>
                  {__(
                    'Marketing, sales, and customer service platform designed to help your business attract more engaged customers. Replace Hubspot with the mission and community-driven ecosystem.'
                  )}
                </p>
                <a href="http://erxes.io/">« Go to home page</a>
              </AuthDescription>
            </Col>
            <Col md={5} mdOffset={1}>
              {content}
            </Col>
          </Grid>
        </AuthContent>
      </Authlayout>
    );
  }
}

export default AuthLayout;
