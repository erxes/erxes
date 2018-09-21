import { Button } from "modules/common/components";
import {
  slideDown,
  slideLeft,
  slideRight
} from "modules/common/utils/animations";
import { Messenger, MessengerPreview } from "modules/engage/styles";
import { WidgetPreviewStyled } from "modules/settings/integrations/components/messenger/widgetPreview/styles";
import { LogoContainer } from "modules/settings/styles";
import React, { Component } from "react";
import {
  BodyContent,
  CenterContainer,
  DropdownContent,
  Embedded,
  FormContainer,
  OverlayTrigger,
  PreviewBody,
  PreviewTitle,
  PreviewWrapper,
  SlideLeftContent
} from "./styles";

export const ShoutBox = MessengerPreview.extend`
  height: 100%;
  min-height: 570px;
  width: auto;
  margin-left: 0;
`;

const WidgetPreview = WidgetPreviewStyled.extend`
  width: 100%;
  max-height: 500px;
`;

const Widget = Messenger.extend`
  animation: ${slideRight} 0.5s linear;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0) 30%,
    rgba(255, 255, 255, 0.3) 60%,
    #eee 100%
  );
`;

const Container = CenterContainer.extend`
  align-items: inherit;
  display: block;
`;

const Dropdown = DropdownContent.extend`
  animation: ${slideDown} 0.5s linear;
  position: relative;
  transition: all 0.2s linear;
  flex: inherit;
  border-bottom-style: solid;
  border-width: 2px;
`;

const SlideLeft = SlideLeftContent.extend`
  animation: ${slideLeft} 0.5s linear;
`;

const SlideRightContent = SlideLeftContent.extend`
  right: 0;
  left: auto;
`;

const SlideRight = SlideRightContent.extend`
  animation: ${slideRight} 0.5s linear;
  box-shadow: -3px 0px 5px rgba(0, 0, 0, 0.25);
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

class CommonPreview extends Component<Props, {}> {
  renderContent() {
    const {
      title,
      theme,
      color,
      btnText,
      bodyValue,
      btnStyle,
      image,
      children
    } = this.props;

    return (
      <PreviewWrapper>
        <PreviewTitle style={{ backgroundColor: theme ? theme : color }}>
          {title}
        </PreviewTitle>

        <PreviewBody embedded="embedded">
          <div>
            <img src={image} alt={image} />
          </div>
          <BodyContent>
            {bodyValue}

            {children}

            {btnText && (
              <Button
                ignoreTrans
                btnStyle={btnStyle}
                style={{ backgroundColor: theme ? theme : color }}
              >
                {btnText}
              </Button>
            )}
          </BodyContent>
        </PreviewBody>
      </PreviewWrapper>
    );
  }

  render() {
    const { type, theme, color } = this.props;

    if (type === "shoutbox") {
      return (
        <ShoutBox>
          <Widget>
            <WidgetPreview className="type-default">
              {this.renderContent()}
            </WidgetPreview>
            <LogoContainer style={{ backgroundColor: theme ? theme : color }}>
              <span>1</span>
            </LogoContainer>
          </Widget>
        </ShoutBox>
      );
    }

    if (type === "popup") {
      return (
        <CenterContainer>
          <OverlayTrigger />
          <FormContainer>{this.renderContent()}</FormContainer>
        </CenterContainer>
      );
    }

    if (type === "dropdown") {
      return (
        <Container>
          <Dropdown style={{ borderColor: theme ? theme : color }}>
            {this.renderContent()}
          </Dropdown>
        </Container>
      );
    }

    if (type === "slideInLeft") {
      return (
        <CenterContainer>
          <SlideLeft>{this.renderContent()}</SlideLeft>
        </CenterContainer>
      );
    }

    if (type === "slideInRight") {
      return (
        <CenterContainer>
          <SlideRight>{this.renderContent()}</SlideRight>
        </CenterContainer>
      );
    }

    return (
      <Container>
        <Embedded>{this.renderContent()}</Embedded>
      </Container>
    );
  }
}

export default CommonPreview;
