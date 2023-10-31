import React from 'react';
import Draft from 'draft-js';
// erxes
import Icon from '@erxes/ui/src/components/Icon';
// local
import { ChatReplyInfo } from '../styles';

type Props = {
  reply: any;
  setReply: (reply: any) => void;
};

const ReplyInfo = (props: Props) => {
  const { reply } = props;
  const draftContent = reply && Draft.convertFromHTML(reply.content);

  if (draftContent) {
    return (
      <ChatReplyInfo>
        <span>
          Replying to{' '}
          <b>
            {reply.createdUser.details.fullName ||
              reply.createdUser.details.email}
          </b>
          <Icon
            icon="times-circle"
            onClick={() => props.setReply(null)}
            size={18}
            style={{ float: 'right', cursor: 'pointer' }}
          />
        </span>
        <p>{draftContent.contentBlocks[0].text}</p>
      </ChatReplyInfo>
    );
  } else {
    return <></>;
  }
};

export default ReplyInfo;
