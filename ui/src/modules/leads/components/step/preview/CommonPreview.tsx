import Button from 'modules/common/components/Button';
import { readFile } from 'modules/common/utils';
import {
  LauncherContainer,
  WebPreview,
  WidgetPreview
} from 'modules/engage/styles';
import { FlexRow } from 'modules/settings/styles';
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
  imgSize?: string;
  bodyValue?: string;
  type?: string;
  btnStyle?: string;
  children?: React.ReactNode;
  currentPage?: number;
  numberOfPages?: number;
  onPageChange?: (page: number) => void;
};

class CommonPreview extends React.Component<Props, {}> {
  renderCallOutBody() {
    const { image, bodyValue, imgSize } = this.props;

    if (!image && !bodyValue) {
      return null;
    }

    return (
      <CallOutBody imgSize= {imgSize}>
        {image && <img src={readFile(image)} alt={image} />}

        {bodyValue && bodyValue}
      </CallOutBody>
    );
  }

  renderButton() {
    const {
      btnStyle,
      theme,
      color,
      btnText = 'Send',
      numberOfPages = 1,
      currentPage = 1
    } = this.props;

    const button = (
      title: string,
      action?: React.MouseEventHandler<HTMLButtonElement>
    ) => {
      return (
        <Button
          ignoreTrans={true}
          btnStyle={btnStyle}
          style={{ backgroundColor: theme ? theme : color, margin: '5px' }}
          onClick={action}
        >
          {title}
        </Button>
      );
    };

    const onbackClick = () => {
      if (this.props.onPageChange) {
        this.props.onPageChange(currentPage - 1);
      }
    };

    const onNextClick = () => {
      if (this.props.onPageChange) {
        this.props.onPageChange(currentPage + 1);
      }
    };

    if (numberOfPages === 1) {
      return button(btnText);
    }

    if (currentPage === 1 && numberOfPages > 1) {
      return button('Next', onNextClick);
    }

    if (numberOfPages > currentPage) {
      return (
        <FlexRow>
          {button('Back', onbackClick)}
          {button('Next', onNextClick)}
        </FlexRow>
      );
    }

    return (
      <FlexRow>
        {button('Back', onbackClick)}
        {button(btnText)}
      </FlexRow>
    );
  }

  renderProgress() {
    const { theme, color, numberOfPages = 1, currentPage = 1 } = this.props;

    if (numberOfPages === 1) {
      return null;
    }

    const percentage = ((currentPage / numberOfPages) * 100).toFixed(1);

    return (
      <div
        id="progress"
        style={{
          background: theme ? theme : color,
          opacity: 0.7,
          height: '13px',
          width: `${percentage}%`
        }}
      >
        <div
          style={{ textAlign: 'center', color: 'white', fontSize: 10 }}
        >{`${percentage}%`}</div>
      </div>
    );
  }

  renderContent() {
    const { title, theme, color, children } = this.props;

    return (
      <React.Fragment>
        <PreviewTitle style={{ backgroundColor: theme ? theme : color }}>
          <div>{title}</div>
        </PreviewTitle>
        {this.renderProgress()}

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
