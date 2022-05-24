import dayjs from 'dayjs';
import {
  ActivityDate,
  FlexBody,
  FlexCenterContent
} from '@erxes/ui/src/activityLogs/styles';
import { IActivityLogItemProps } from '@erxes/ui/src/activityLogs/types';
import Tags from '@erxes/ui/src/components/Tags';
import Tip from '@erxes/ui/src/components/Tip';
import { renderUserFullName } from '@erxes/ui/src/utils';
import React from 'react';

class TaggedLog extends React.Component<IActivityLogItemProps> {
  renderContent = () => {
    const { activity } = this.props;
    const { contentDetail, createdByDetail } = activity;

    let userName = 'Unknown';

    if (createdByDetail && createdByDetail.type === 'user') {
      const { content } = createdByDetail;

      if (content && content.details) {
        userName = renderUserFullName(createdByDetail.content);
      }
    }

    const { tags } = contentDetail;

    const tagNames = tags.map(tag => {
      return <Tags key={tag._id} tags={[tag]} size="medium" />;
    });

    return (
      <span>
        {userName} change tag to
        {tagNames}
      </span>
    );
  };

  render() {
    const { createdAt } = this.props.activity;

    return (
      <FlexCenterContent>
        <FlexBody>{this.renderContent()}</FlexBody>
        <Tip text={dayjs(createdAt).format('llll')}>
          <ActivityDate>
            {dayjs(createdAt).format('MMM D, h:mm A')}
          </ActivityDate>
        </Tip>
      </FlexCenterContent>
    );
  }
}

export default TaggedLog;
