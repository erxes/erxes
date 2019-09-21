import Button from 'modules/common/components/Button';
import {
  LauncherContainer,
  WebPreview,
  WidgetPreview
} from 'modules/engage/styles';
import React from 'react';
import styled from 'styled-components';
import {
  BodyContent,
  CallOutBody,
  CenterContainer,
  DropdownContent,
  Embedded,
  OverlayTrigger,
  PopUpContainer,
  PreviewBody,
  PreviewContainer,
  PreviewTitle,
  SlideLeftContent,
  SlideRightContent
} from './styles';

export const ShoutBox = styled(WebPreview)`
  height: 100%;
  width: auto;
  margin-left: 0;
`;

type Props = {
  title?: string;
  theme?: string;
  color?: string;
  btnText?: string;
  image?: string;
  bodyValue?: string;
  type?: string;
  btnStyle?: string;
  children?: React.ReactNode;
};

class CommonPreview extends React.Component<Props, {}> {
  renderCallOutBody() {
    const { image, bodyValue } = this.props;

    if (!image && !bodyValue) {
      return null;
    }

    return (
      <CallOutBody>
        {image && <img src={image} alt={image} />}
        {bodyValue && bodyValue}
      </CallOutBody>
    );
  }

  renderButton() {
    const { btnStyle, btnText, theme, color } = this.props;

    if (!btnText) {
      return null;
    }

    return (
      <Button
        ignoreTrans={true}
        btnStyle={btnStyle}
        style={{ backgroundColor: theme ? theme : color }}
      >
        {btnText}
      </Button>
    );
  }

  renderContent() {
    const { title, theme, color, children } = this.props;

    return (
      <React.Fragment>
        <PreviewTitle style={{ backgroundColor: theme ? theme : color }}>
          <div>{title}</div>
        </PreviewTitle>

        <PreviewBody embedded="embedded">
          {this.renderCallOutBody()}

          <BodyContent>
            {children}

            {this.renderButton()}
          </BodyContent>
        </PreviewBody>
      </React.Fragment>
    );
  }

  render() {
    const { type, theme, color } = this.props;

    if (type === 'shoutbox') {
      return (
        <ShoutBox>
          <WidgetPreview className="type-default">
            {this.renderContent()}
          </WidgetPreview>
          <LauncherContainer style={{ backgroundColor: theme ? theme : color }}>
            <span>1</span>
          </LauncherContainer>
        </ShoutBox>
      );
    }

    if (type === 'popup') {
      return (
        <CenterContainer>
          <OverlayTrigger />
          <PopUpContainer>{this.renderContent()}</PopUpContainer>
        </CenterContainer>
      );
    }

    if (type === 'dropdown') {
      return (
        <PreviewContainer>
          <DropdownContent style={{ borderColor: theme ? theme : color }}>
            {this.renderContent()}
          </DropdownContent>
        </PreviewContainer>
      );
    }

    if (type === 'slideInLeft') {
      return (
        <PreviewContainer>
          <SlideLeftContent>{this.renderContent()}</SlideLeftContent>
        </PreviewContainer>
      );
    }

    if (type === 'slideInRight') {
      return (
        <PreviewContainer>
          <SlideRightContent>{this.renderContent()}</SlideRightContent>
        </PreviewContainer>
      );
    }

    return (
      <PreviewContainer>
        <Embedded>{this.renderContent()}</Embedded>
      </PreviewContainer>
    );
  }
}

export default CommonPreview;
