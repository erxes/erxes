import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { NameCard, Icon } from 'modules/common/components';
import {
  ActivityRow,
  AvatarWrapper,
  ActivityWrapper,
  ActivityCaption,
  ActivityContent,
  ActivityDate,
  ActivityIcon
} from 'modules/activityLogs/styles';

const ActivityItem = data => {
  const formatDate = date => {
    return moment(date).fromNow();
  };

  return (
    <ActivityRow key={Math.random()}>
      <ActivityIcon color={data.color}>
        <Icon icon={data.icon || ''} />
      </ActivityIcon>
      <ActivityWrapper>
        <AvatarWrapper>
          <NameCard.Avatar user={data.by} size={40} />
        </AvatarWrapper>
        <ActivityCaption>{data.caption}</ActivityCaption>
        <ActivityDate>{formatDate(data.date)}</ActivityDate>
        {data.content && <ActivityContent>{data.content}</ActivityContent>}
      </ActivityWrapper>
    </ActivityRow>
  );
};

ActivityItem.propTypes = {
  data: PropTypes.object.isRequired
};

export default ActivityItem;
