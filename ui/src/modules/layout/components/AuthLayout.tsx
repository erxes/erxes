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

class AuthLayout extends React.Component<Props & { pluginsData?: any[] }, {}> {
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

    if (pluginsData && pluginsData.length > 0) {
      if (!pluginsData.map(d => d.error)[0]) {
        var url = "__('Homepage link')";
        var descriptions = 'Open Source Growth Marketing Platform';
        if (pluginsData.map(d => d.url).toString())
          url = pluginsData.map(d => d.url).toString();

        if (pluginsData.map(d => d.pageDesc).toString())
          descriptions = pluginsData.map(d => d.pageDesc).toString();

        return (
          <>
            <img
              src={readFile(pluginsData.map(d => d.loginPageLogo)[0])}
              alt="erxes"
            />
            <h1 style={{ color: pluginsData.map(d => d.textColor)[0] }}>
              {__(descriptions)}
            </h1>
            <p style={{ color: pluginsData.map(d => d.textColor)[0] }}>
              {__(
                'Marketing, sales, and customer service platform designed to help your business attract more engaged customers. Replace Hubspot with the mission and community-driven ecosystem.'
              )}
            </p>
            <a href={url}>«{__('Go to home page')}</a>
          </>
        );
      }
    }

    return (
      <>
        <img src="/images/logo.png" alt="erxes" />
        <h1>{__('Open Source Growth Marketing Platform')}</h1>
        <p>
          {__(
            'Marketing, sales, and customer service platform designed to help your business attract more engaged customers. Replace Hubspot with the mission and community-driven ecosystem.'
          )}
        </p>
        <a href={__('Homepage link')}>« {__('Go to home page')}</a>
      </>
    );
  }

  componentDidMount() {
    // click-jack attack defense
    bustIframe();
  }
  render() {
    const { content, col = { first: 6, second: 5 }, pluginsData } = this.props;

    if (pluginsData && pluginsData.length > 0) {
      if (!pluginsData.map(d => d.error)[0])
        return (
          <Authlayout
            className="auth-container"
            backgroundColor={pluginsData.map(d => d.backgroundColor)[0] || ''}
          >
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
class AuthLayoutWrapper extends React.Component<Props, any> {
  constructor(props) {
    super(props);

    this.state = { isReady: false, pluginsData: [] };
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
      this.setState({ isReady: true, pluginsData: response });
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
