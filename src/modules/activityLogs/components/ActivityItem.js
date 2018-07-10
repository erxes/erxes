import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { NameCard, Icon } from 'modules/common/components';
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
  const DAY = 1000 * 60 * 60 * 24;
  const diff = new Date().getTime() - data.date;
  const displayDate =
    diff <= DAY
      ? moment(data.date).fromNow()
      : `${moment(data.date).format('ll')} at ${moment(data.date).format(
          'LT'
        )}`;

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
          <ActivityDate>{displayDate}</ActivityDate>
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
