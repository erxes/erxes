import Button from 'modules/common/components/Button';
import { __, bustIframe, getEnv, readFile } from 'modules/common/utils';
import { pluginsOfRoutes } from 'pluginUtils';
import React from 'react';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
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

class AuthLayout extends React.Component<Props & { pluginsData? }, {}> {
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
    const { description, pluginsData } = this.props;

    if (description) {
      return (
        <>
          <img src="/images/logo.png" alt="erxes" />
          {description}
        </>
      );
    }

    let url = "__('Homepage link')";
    let descriptions = 'Open Source Growth Marketing Platform';
    let src = '/images/logo.png';
    let textColor = '';
    const content =
      'Marketing, sales, and customer service platform designed to help your business attract more engaged customers. Replace Hubspot with the mission and community-driven ecosystem.';

    if (pluginsData && !pluginsData.error) {
      if (pluginsData.url) {
        url = pluginsData.url;
      }

      if (pluginsData.pageDesc) {
        descriptions = pluginsData.pageDesc;
      }

      if (pluginsData.loginPageLogo) {
        src = readFile(pluginsData.loginPageLogo);
      }

      if (pluginsData.textColor) {
        textColor = pluginsData.textColor;
      }
    }

    return (
      <>
        <img src={src} alt="erxes" />
        <h1 style={{ color: textColor }}>{__(descriptions)}</h1>
        <p>{__(content)}</p>
        <a href={__(url)}>« {__('Go to home page')}</a>
      </>
    );
  }

  componentDidMount() {
    // click-jack attack defense
    bustIframe();
  }
  render() {
    const { content, col = { first: 6, second: 5 }, pluginsData } = this.props;
    let backgroundColor = '';
    if (pluginsData && !pluginsData.error && pluginsData.backgroundColor) {
      backgroundColor = pluginsData.backgroundColor;
    }

    return (
      <Authlayout className="auth-container" backgroundColor={backgroundColor}>
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
class AuthLayoutWrapper extends React.Component<Props, any> {
  constructor(props) {
    super(props);

    this.state = {
      isReady: false,
      pluginsData: { error: 'not defined branding' }
    };
  }

  componentDidMount() {
    const { preAuths } = pluginsOfRoutes();

    const promises: any[] = [];

    if (preAuths.length === 0) {
      this.setState({ isReady: true });
    }

    const { REACT_APP_API_URL } = getEnv();

    for (const preAuth of preAuths) {
      promises.push(preAuth({ API_URL: REACT_APP_API_URL }));
    }

    Promise.all(promises).then(response => {
      if (response.length > 0) {
        this.setState({ isReady: true, pluginsData: response[0] });
      }
    });
  }

  render() {
    const { isReady, pluginsData } = this.state;

    if (!isReady) {
      return null;
    }

    const props = { ...this.props, pluginsData };

    return <AuthLayout {...props} key={Math.random()} />;
  }
}

export default AuthLayoutWrapper;
