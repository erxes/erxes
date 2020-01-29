import dayjs from 'dayjs';
import {
  ActivityDate,
  ActivityRow,
  FlexBody,
  FlexCenterContent
} from 'modules/activityLogs/styles';
import { IActivityLog } from 'modules/activityLogs/types';
import Tip from 'modules/common/components/Tip';
import React from 'react';

type Props = {
  activity: IActivityLog;
};

class CheckListItem extends React.Component<Props, { toggleItems: boolean }> {
  render() {
    const { activity } = this.props;
    const {
      contentTypeDetail,
      content,
      action,
      createdByDetail,
      createdAt
    } = activity;

    let userName = 'Unknown';

    if (createdByDetail && createdByDetail.type === 'user') {
      if (createdByDetail.content.details) {
        userName = createdByDetail.content.details.fullName || 'Unknown';
      }
    }

    const name = contentTypeDetail.title || content.name;
    let contentAction = '';

    switch (action) {
      case 'delete':
        contentAction = 'deleted';
        break;
      case 'create':
        contentAction = 'created';
        break;
      case 'checked':
        contentAction = 'checked';
        break;
      case 'unChecked':
        contentAction = 'unchecked';
        break;
    }

    return (
      <ActivityRow>
        <FlexCenterContent>
          <FlexBody>
            <>
              <span>
                {userName} <strong>{contentAction}</strong> {name}
              </span>
            </>
          </FlexBody>
          <Tip text={dayjs(createdAt).format('llll')}>
            <ActivityDate>
              {dayjs(createdAt).format('MMM D, h:mm A')}
            </ActivityDate>
          </Tip>
        </FlexCenterContent>
      </ActivityRow>
    );
  }
}

export default CheckListItem;
