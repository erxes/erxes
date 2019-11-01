import dayjs from 'dayjs';
import {
  ActivityDate,
  ActivityIcon,
  ActivityRow,
  AvatarWrapper,
  FlexBody,
  FlexContent
} from 'modules/activityLogs/styles';
import Icon from 'modules/common/components/Icon';
import NameCard from 'modules/common/components/nameCard/NameCard';
import Tip from 'modules/common/components/Tip';
import { colors } from 'modules/common/styles';
import React from 'react';

type Props = {
  data: any;
  content: React.ReactNode;
  body: React.ReactNode;
};

const ActivityRowComponent = (props: Props) => {
  const { data, content, body } = props;

  return (
    <ActivityRow key={Math.random()}>
      <ActivityIcon color={data.color || colors.colorCoreGray}>
        <Icon icon={data.icon || 'clipboard-notes'} />
      </ActivityIcon>
      <React.Fragment>
        <FlexContent>
          <AvatarWrapper>
            <NameCard.Avatar user={data.by} size={32} />
          </AvatarWrapper>
          <FlexBody>{body}</FlexBody>
          <Tip text={dayjs(data.createdAt).format('llll')}>
            <ActivityDate>
              {dayjs(data.createdAt).format('MMM D, h:mm A')}
            </ActivityDate>
          </Tip>
        </FlexContent>
        {data.content && content}
      </React.Fragment>
    </ActivityRow>
  );
};

export default ActivityRowComponent;
