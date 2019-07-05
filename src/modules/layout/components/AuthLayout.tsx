import Button from 'modules/common/components/Button';
import { __ } from 'modules/common/utils';
import React from 'react';
import { Col, Grid } from 'react-bootstrap';
import {
  AuthContent,
  AuthDescription,
  Authlayout,
  CenterContent,
  MobileRecommend
} from '../styles';

type Props = {
  content: React.ReactNode;
};

class AuthLayout extends React.Component<Props, {}> {
  renderContent(desciption: string, link: string) {
    return (
      <MobileRecommend>
        <CenterContent>
          <div>
            <b>{__('erxes Inc')}</b>
            <div>{__(desciption)}</div>
          </div>
          <Button btnStyle="link" size="small" href={link}>
            {__('Get')}
          </Button>
        </CenterContent>
      </MobileRecommend>
    );
  }

  renderRecommendMobileVersion() {
    const { userAgent } = navigator;

    if (userAgent.indexOf('Mobile') !== -1) {
      if (userAgent.match(/iPhone|iPad|iPod/i)) {
        return this.renderContent(
          'Download ios app for free on the App Store',
          'https://itunes.apple.com/zw/app/erxes-inc/id1454657885?mt=8&fbclid=IwAR1_A-3dPkw4oUh3r-4lpAvs_Ie5FWOTy1dduFy7eJZbpWKJJ9ukzu9ZNUc'
        );
      }

      if (userAgent.match(/Android/i)) {
        return this.renderContent(
          'Download android app for free on the Google play',
          'https://play.google.com/store/apps/details?id=io.erxes.erxes_android&fbclid=IwAR1bVPBSE0pC_KUNNjOJQA4upb1AuTUfqFcDaHTHTptyke7rNvuvb2mgwb0'
        );
      }
    }

    return null;
  }

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
        {this.renderRecommendMobileVersion()}
      </Authlayout>
    );
  }
}

export default AuthLayout;
