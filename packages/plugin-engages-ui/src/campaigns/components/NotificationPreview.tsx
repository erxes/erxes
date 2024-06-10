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

const From = styled.div`
  font-weight: 700;
`;

const Message = styled.div`
  word-break: break-word;
  font-size: 12px;
`;

const MobileMessage = styled.div`
  width: 100%;
  font-size: 12px;
`;

const MobileFrame = styled.div`
  width: 360px;
  height: 555px;
  background: url('/images/previews/mobile-notification.png') no-repeat;
  background-size: 100%;
  position: relative;
  display: flex;
  justify-content: left;
  padding: 6rem 2rem 1rem 4rem;
`;

const MobileContent = styled.div`
  &::before {
    content: '';
    position: absolute;
    top: 1.5rem;
    left: 0.5rem;
    width: 10px;
    height: 10px;
    background: #3b80d1;
    border-radius: 5px;
  }
  position: relative;
  width: 100%;
  height: fit-content;
  background: #f5f5f5;
  border-radius: 18px;
  padding: 1rem 1rem 1rem 1.5rem;
  margin: 1rem 0.5rem;
  font-size: 12px;
  span {
    font-weight: bold;
  }
`;

const DesktopPreview = styled.div`
  background: url('/images/previews/desktop-notification.png') no-repeat;
  background-position: center;
  width: 100%;
  background-size: contain;
  border: 1px solid ${colors.borderPrimary};
  border-radius: ${dimensions.unitSpacing / 2}px;
  flex: 1;
  overflow: auto;
  padding-top: ${dimensions.headerSpacing - 20}px;
  margin-top: ${dimensions.coreSpacing}px;
`;

const DesktopContent = styled.div`
  margin-top: 10%;
  width: 22%;
  margin-right: 13%;
  padding-left: 1rem;
  margin-left: auto;
  position: relative;
  &::before {
    content: '';
    position: absolute;
    top: 0.5rem;
    left: 0rem;
    width: 10px;
    height: 10px;
    background: #3b80d1;
    border-radius: 5px;
  }
`;

type Props = {
  message: string;
  title: string;
  isMobile: boolean;
};

function NotificationPreview(props: Props) {
  return (
    <Preview>
      <h3>
        <Icon icon="eye" /> {__('Preview')}
      </h3>
      {props.isMobile ? (
        <MobileFrame>
          <MobileContent>
            <span className="bold">{props.title || '[From]'}</span>
            {props.message && <MobileMessage>{props.message}</MobileMessage>}
          </MobileContent>
        </MobileFrame>
      ) : (
        <DesktopPreview>
          <DesktopContent>
            <From>{props.title || '[From]'}</From>
            {props.message && <Message>{props.message}</Message>}
          </DesktopContent>
        </DesktopPreview>
      )}
    </Preview>
  );
}

export default NotificationPreview;
