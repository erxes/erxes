import dayjs from 'dayjs';
import {
  ActivityDate,
  ActivityRow,
  FlexBody,
  FlexCenterContent
} from '@erxes/ui/src/activityLogs/styles';
import { IActivityLogItemProps } from '@erxes/ui/src/activityLogs/types';
import Tip from '@erxes/ui/src/components/Tip';
import { renderUserFullName } from '@erxes/ui/src/utils';
import React from 'react';

class CheckListItem extends React.Component<
  IActivityLogItemProps,
  { toggleItems: boolean }
> {
  render() {
    const { activity } = this.props;
    const { content, action, createdByDetail, createdAt } = activity;

    let userName = 'Unknown';

    if (createdByDetail && createdByDetail.type === 'user') {
      const createdByDetailContent = createdByDetail.content
        ? createdByDetail.content
        : {};

      if (createdByDetailContent && createdByDetailContent.details) {
        userName = renderUserFullName(createdByDetail.content);
      }
    }

    const name = content.title || content.name;

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
