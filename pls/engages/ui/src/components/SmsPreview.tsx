import Icon from 'erxes-ui/lib/components/Icon';
import colors from 'erxes-ui/lib/styles/colors';
import { __ } from 'erxes-ui/lib/utils';
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
  margin-top: 91px;
  font-size: 11px;
`;

const Message = styled.div`
  position: absolute;
  padding: 6px 10px;
  background: #e9e9eb;
  border-radius: 18px;
  top: 120px;
  left: 35px;
  max-width: 60%;
  word-break: break-word;
  color: #0a0a0a;
`;

const MobileFrame = styled.div`
  width: 360px;
  height: 555px;
  background: url('/images/previews/iphone-mockup.png') no-repeat;
  background-size: 100%;
  position: relative;
  display: flex;
  justify-content: center;
`;

type Props = {
  message: string;
  title: string;
};

function SmsPreview(props: Props) {
  return (
    <Preview>
      <h3>
        <Icon icon="eye" /> {__('Preview')}
      </h3>
      <MobileFrame>
        <From>{props.title || '[From]'}</From>
        {props.message && <Message>{props.message}</Message>}
      </MobileFrame>
    </Preview>
  );
}

export default SmsPreview;
