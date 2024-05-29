import {
  AcitivityHeader,
  ActivityDate,
  ActivityIcon,
  ActivityRow,
  MessageContent,
} from '../styles';
import React from 'react';

import { CenterText } from '@erxes/ui-log/src/activityLogs/styles';
import Icon from '@erxes/ui/src/components/Icon';
import { Link } from 'react-router-dom';
import Tip from '@erxes/ui/src/components/Tip';
import { __ } from '@erxes/ui/src/utils/core';
import dayjs from 'dayjs';
import { getIconAndColor } from '@erxes/ui-log/src/activityLogs/utils';

import { colors, dimensions } from '@erxes/ui/src/styles';

import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { readFile } from '@erxes/ui/src/utils/core';
import Attachment from '@erxes/ui/src/components/Attachment';
import xss from 'xss';
import { urlify } from '@erxes/ui/src/utils/urlParser';
import withConsumer from '../withConsumer';
import { IUser } from '@erxes/ui/src/auth/types';
import { can } from '@erxes/ui/src/utils/core';

type Props = {
  contentType: string;
  activity: any;
  currentUser: IUser;
};

const MessageBody = styledTS<{ $staff?: boolean }>(styled.div)`
  display: flex;
  flex-direction: ${(props) => (props.$staff ? 'row-reverse' : 'row')};
  align-items: center;

  footer {
    flex-shrink: 0;
    font-size: 11px;
    display: inline-block;
    color: ${colors.colorCoreLightGray};
    margin: 0 10px;
    cursor: pointer;
  }

  > img {
    box-shadow: 0 1px 1px 0 ${colors.darkShadow};
    max-width: 100%;
  }
`;

const CallWrapper = styled.div`
  border: 1px solid ${colors.borderPrimary};
  border-radius: 20px 20px 20px 0;
  padding: ${dimensions.unitSpacing}px;
  width: 320px;
  background: ${colors.colorWhite};

  > div {
    h5 {
      margin: 0;
    }

    span {
      color: ${colors.colorCoreGray};
      text-transform: capitalize;
    }
  }
`;

const StatusContent = styled.div`
  display: flex;
  align-items: center;
`;
const Audio = styled.div`
  flex: 1;

  span {
    font-size: 11px;
    display: block;
    margin: 10px 0 5px 0;
  }
`;

const ActivityItem = (props: Props) => {
  const { activity, currentUser } = props;
  const { contentTypeDetail = {}, contentType = '' } = activity;
  const { history = {}, conversationMessages = [] } = contentTypeDetail;
  const { createdAt = '', recordUrl = '' } = history;

  const renderAudio = () => {
    return (
      can('showCallRecord', currentUser) && (
        <Audio>
          <audio controls={true}>
            <source src={readFile(recordUrl)} type="audio/wav" />{' '}
          </audio>
        </Audio>
      )
    );
  };

  const renderWhom = (contentTypeDetail) => {
    const { recordUrl, callType, callDuration } = contentTypeDetail;

    return (
      <MessageBody>
        <CallWrapper>
          <StatusContent>
            <div>
              <h5>{callType} call</h5>
              <span>Call duration: {callDuration}s</span>
            </div>
          </StatusContent>
          {recordUrl && renderAudio()}
        </CallWrapper>
      </MessageBody>
    );
  };

  const renderExpandButton = (contentTypeDetail) => {
    const { conversationId } = contentTypeDetail;

    return (
      <CenterText>
        <Link to={`/inbox/index?_id=${conversationId}`}>
          {__('See full call conversation')} <Icon icon="angle-double-right" />
        </Link>
      </CenterText>
    );
  };
  if (contentType && !contentType.includes('calls')) {
    return null;
  }
  const iconAndColor = getIconAndColor('callpro');

  const renderAttachment = (hasAttachment: boolean, message: any) => {
    const { attachments } = message;

    if (!hasAttachment) {
      return null;
    }

    return attachments.map((attachment, index) => {
      return <Attachment key={index} attachment={attachment} simple={true} />;
    });
  };

  const renderContent = (message: any) => {
    const hasAttachment = message.attachments && message.attachments.length > 0;

    return message.content ? (
      <>
        <MessageContent $staff={true} $internal={message.internal}>
          <span
            dangerouslySetInnerHTML={{ __html: xss(urlify(message.content)) }}
          />
          {renderAttachment(hasAttachment, message)}
        </MessageContent>
      </>
    ) : (
      <></>
    );
  };

  return (
    history && (
      <ActivityRow>
        <Tip text={'Phone call'} placement="top">
          <ActivityIcon color={iconAndColor.color}>
            <Icon icon={iconAndColor.icon} />
          </ActivityIcon>
        </Tip>

        <AcitivityHeader>
          <ActivityDate>{dayjs(createdAt).format('lll')}</ActivityDate>
        </AcitivityHeader>
        {renderWhom(history)}
        {conversationMessages?.map((message) => renderContent(message))}
        {renderExpandButton(history)}
      </ActivityRow>
    )
  );
};

export default withConsumer(ActivityItem);
