import Icon from '@erxes/ui/src/components/Icon';
import { colors, dimensions } from '@erxes/ui/src/styles';
import { __ } from '@erxes/ui/src/utils/core';
import React from 'react';
import styled from 'styled-components';

const Preview = styled.div`
  position: realative;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
  flex-direction: column;

  h3 {
    font-size: 16px;
    color: ${colors.colorCoreGray};
  }
`;

const Message = styled.div`
  width: 100%;
  font-size: 13px;
  word-break: break-word;
  span {
    font-weight: bold;
  }
`;

const MobileFrame = styled.div`
  width: 420px;
  height: 550px;
  background: url('/images/previews/mobile-notification.png') no-repeat;
  background-size: 100%;
  position: relative;
  display: flex;
  justify-content: left;
  padding: 6rem 2rem 1rem 4rem;
`;

const MobileContent = styled.div`
  position: absolute;
  top: 38%;
  width: 100%;
  padding: 1rem 5rem 1rem 2rem;
  margin: 1rem 0.5rem;
  font-size: 12px;
  color: #fff;

  span {
    font-weight: bold;
    font-size: 14px;
  }
`;

const DesktopPreview = styled.div`
  background: url('/images/previews/desktop-notification.png') no-repeat;
  background-position: center;
  width: 100%;
  background-size: contain;
  flex: 1;
  margin: ${dimensions.coreSpacing}px;
`;

const DesktopContent = styled.div`
  margin-top: 15%;
  width: 32%;
  margin-right: 10%;
  margin-left: auto;
  position: relative;
  @media only screen and (max-width: 1400px) {
    margin-top: 17%;
    width: 34%;
    margin-right: 6%;
  }
`;

const WebPushPreview = styled.div`
  background: url('/images/previews/web-push.png') no-repeat;
  background-position: center;
  width: 100%;
  background-size: contain;
  flex: 1;
  margin: ${dimensions.coreSpacing}px;
`;

const WebPushContent = styled.div`
  margin-top: 10.5%;
  width: 40%;
  margin-right: 6%;
  margin-left: auto;
  position: relative;
  @media only screen and (max-width: 1400px) {
    margin-top: 13%;
  }
`;

type Props = {
  message: string | '';
  title: string | '';
  isMobile: boolean | false;
  isWebPush: boolean | false;
};

function NotificationPreview(props: Props) {
  const renderPreview = () => {
    const { message, title, isMobile, isWebPush } = props;

    if (isWebPush) {
      return (
        <WebPushPreview>
          <WebPushContent>
            <Message>
              <span>{title} </span> {message}
            </Message>
          </WebPushContent>
        </WebPushPreview>
      );
    }

    if (isMobile) {
      return (
        <MobileFrame>
          <MobileContent>
            <span>{title}</span>
            <Message>{message}</Message>
          </MobileContent>
        </MobileFrame>
      );
    }

    return (
      <DesktopPreview>
        <DesktopContent>
          <Message>
            <span>{title} </span> {message}
          </Message>
        </DesktopContent>
      </DesktopPreview>
    );
  };

  return (
    <Preview>
      <h3>
        <Icon icon="eye" /> {__('Preview')}
      </h3>
      {renderPreview()}
    </Preview>
  );
}

export default NotificationPreview;
