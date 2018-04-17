import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { NameCard, Icon, Tip } from 'modules/common/components';
import {
  ActivityRow,
  AvatarWrapper,
  ActivityContent,
  ActivityDate,
  ActivityIcon,
  FlexContent,
  FlexBody
} from 'modules/activityLogs/styles';

const ActivityItem = data => {
  return (
    <ActivityRow key={Math.random()}>
      <ActivityIcon color={data.color}>
        <Icon erxes icon={data.icon || ''} />
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

ActivityItem.propTypes = {
  data: PropTypes.object.isRequired
};

export default ActivityItem;
