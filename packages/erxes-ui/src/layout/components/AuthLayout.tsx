import Button from '@erxes/ui/src/components/Button';
import { __, bustIframe } from '../../utils';
import React from 'react';
import Container from 'react-bootstrap/Container';
import {
  AuthWrapper,
  AuthBox,
  AuthItem,
  AuthContent,
  AuthCustomDescription,
  AuthDescription,
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

    if (description) {
      return (
        <AuthCustomDescription>
          <img src="/images/logo.png" alt="erxes" />
          {description}
        </AuthCustomDescription>
      );
    }

    return (
      <AuthDescription>
        <h1>{__('Grow your business better and faster')}</h1>
        <h2>
          {__('Single ')}
          <b>{__('experience operating system (XOS)')}</b>
          {__(' to align your entire business')}
        </h2>
      </AuthDescription>
    );
  }

  componentDidMount() {
    // click-jack attack defense
    bustIframe();
  }

  render() {
    const { content, col = { first: 6, second: 6 } } = this.props;

    return (
      <AuthWrapper>
        <Container>
          <AuthBox>
            <AuthItem order={1}>
              <AuthContent>{content}</AuthContent>
            </AuthItem>
            <AuthItem order={0}>{this.renderDesciption()}</AuthItem>
          </AuthBox>
          {this.renderRecommendMobileVersion()}
        </Container>
      </AuthWrapper>
    );
  }
}

export default AuthLayout;
