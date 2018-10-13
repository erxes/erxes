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
            <Col md={7}>
              <AuthDescription>
                <img src="/images/logo.png" alt="erxes" />
                <h1>{__('Democratizing business')}</h1>
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

export default AuthLayout;
