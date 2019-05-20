import { Button } from 'modules/common/components';
import { __ } from 'modules/common/utils';
import * as React from 'react';
import { Col, Grid } from 'react-bootstrap';
import {
  AppName,
  AuthContent,
  AuthDescription,
  Authlayout,
  CenterContent,
  SmallWrapper
} from '../styles';

type Props = {
  content: React.ReactNode;
};

class AuthLayout extends React.Component<Props, {}> {
  renderRecommendMobileVersion() {
    if (navigator.userAgent.indexOf('Mobile') !== -1) {
      return (
        <SmallWrapper>
          <CenterContent>
            <AppName>
              <b>Erxes Inc</b>
              <span>Download ios app for free on the App Store.</span>
            </AppName>
            <Button btnStyle="link" size="small">
              Get
            </Button>
          </CenterContent>
          {/* <img src="/images/ios.png" /> */}
        </SmallWrapper>
      );
    }

    return null;
  }

  render() {
    const { content } = this.props;

    // tslint:disable-next-line:no-console
    console.log(
      window.orientation,
      navigator.userAgent,
      navigator.userAgent.indexOf('Mobile') !== -1
    );

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
        {this.renderRecommendMobileVersion()}
      </Authlayout>
    );
  }
}

export default AuthLayout;
