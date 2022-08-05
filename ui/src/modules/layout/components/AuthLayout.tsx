import Button from 'modules/common/components/Button';
import xss from 'xss';
import { __, bustIframe, readFile } from 'modules/common/utils';
import React from 'react';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import { getThemeItem } from 'utils';
import {
  AuthContent,
  AuthDescription,
  Authlayout,
  CenterContent,
  MobileRecommend
} from '../styles';

type Props = {
  content: React.ReactNode;
  description?: React.ReactNode;
  col?: { first: number; second: number };
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
      if (userAgent.match(/Android/i)) {
        return this.renderContent(
          'Download android app for free on the Google play',
          'https://play.google.com/store/apps/details?id=io.erxes.erxes_android&fbclid=IwAR1bVPBSE0pC_KUNNjOJQA4upb1AuTUfqFcDaHTHTptyke7rNvuvb2mgwb0'
        );
      }
    }

    return null;
  }

  renderDesciption() {
    const { description } = this.props;
    const logo = getThemeItem('logo');
    const themeDescription = getThemeItem('login_page_description');
    const logoSrc = logo ? readFile(logo) : '/images/logo.png';

    if (description) {
      return (
        <>
          <img src={logoSrc} alt="erxes" />
          {description}
        </>
      );
    }

    return (
      <div>
        <img src={logoSrc} alt="erxes" />

        {themeDescription ? (
          <div
            dangerouslySetInnerHTML={{
              __html: xss(themeDescription)
            }}
          />
        ) : (
          <>
            <h1>{__('Open Source Growth Marketing Platform')}</h1>
            <p>
              {__(
                'Marketing, sales, and customer service platform designed to help your business attract more engaged customers. Replace Hubspot with the mission and community-driven ecosystem.'
              )}
            </p>
            <a href={__('Homepage link')}>« {__('Go to home page')}</a>
          </>
        )}
      </div>
    );
  }

  componentDidMount() {
    // click-jack attack defense
    bustIframe();
  }

  render() {
    const { content, col = { first: 6, second: 5 } } = this.props;

    return (
      <Authlayout className="auth-container">
        <AuthContent>
          <Container>
            <Col md={col.first}>
              <AuthDescription>{this.renderDesciption()}</AuthDescription>
            </Col>
            <Col md={{ span: col.second, offset: 1 }}>{content}</Col>
          </Container>
        </AuthContent>
        {this.renderRecommendMobileVersion()}
      </Authlayout>
    );
  }
}

export default AuthLayout;
