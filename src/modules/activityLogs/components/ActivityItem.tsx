import {
  ActivityContent,
  ActivityDate,
  ActivityIcon,
  ActivityRow,
  AvatarWrapper,
  FlexBody,
  FlexContent
} from 'modules/activityLogs/styles';
import { Icon, NameCard, Tip } from 'modules/common/components';
import moment from 'moment';
import React, { Fragment } from 'react';

type Props = {
  data: any
};

const ActivityItem = (props: Props) => {
  const { data } = props;

  return (
    <ActivityRow key={Math.random()}>
      <ActivityIcon color={data.color}>
        <Icon icon={data.icon || ''} />
      </ActivityIcon>
      <Fragment>
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
      </Fragment>
    </ActivityRow>
  );
};

export default ActivityItem;
