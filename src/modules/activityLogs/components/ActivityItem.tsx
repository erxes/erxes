import {
  ActivityContent,
  ActivityDate,
  ActivityIcon,
  ActivityRow,
  AvatarWrapper,
  EmailContent,
  FlexBody,
  FlexContent
} from 'modules/activityLogs/styles';
import { Icon, NameCard, Tip } from 'modules/common/components';
import * as moment from 'moment';
import * as React from 'react';

type Props = {
  data: any;
};

const ActivityItem = (props: Props) => {
  const { data } = props;

  if (data.action === 'email-send') {
    const content = JSON.parse(data.content);

    return (
      <ActivityRow key={Math.random()}>
        <ActivityIcon color={data.color}>
          <Icon icon={data.icon || ''} />
        </ActivityIcon>
        <React.Fragment>
          <FlexContent>
            <AvatarWrapper>
              <NameCard.Avatar user={data.by} size={40} />
            </AvatarWrapper>
            <FlexBody>
              <p>{content.subject}</p>
              <div>
                {data.caption}
                <Icon icon="rightarrow" /> To: <span>{content.toEmails}</span>
                {content.cc && <span>Cc: {content.cc}</span>}
                {content.bcc && <span>Bcc: {content.bcc}</span>}
              </div>
            </FlexBody>
            <Tip text={moment(data.date).format('lll')}>
              <ActivityDate>{moment(data.date).fromNow()}</ActivityDate>
            </Tip>
          </FlexContent>
          {data.content && (
            <EmailContent dangerouslySetInnerHTML={{ __html: content.body }} />
          )}
        </React.Fragment>
      </ActivityRow>
    );
  }

  return (
    <ActivityRow key={Math.random()}>
      <ActivityIcon color={data.color}>
        <Icon icon={data.icon || ''} />
      </ActivityIcon>
      <React.Fragment>
        <FlexContent>
          <AvatarWrapper>
            <NameCard.Avatar user={data.by} size={40} />
          </AvatarWrapper>
          <FlexBody>
            <div>{data.caption}</div>
          </FlexBody>
          <Tip text={moment(data.date).format('lll')}>
            <ActivityDate>{moment(data.date).fromNow()}</ActivityDate>
          </Tip>
        </FlexContent>
        {data.content && <ActivityContent>{data.content}</ActivityContent>}
      </React.Fragment>
    </ActivityRow>
  );
};

export default ActivityItem;
