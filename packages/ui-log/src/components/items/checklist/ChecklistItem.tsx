import {
  ActivityDate,
  ActivityRow,
  FlexBody,
  FlexCenterContent
} from '@erxes/ui-log/src/activityLogs/styles';

import { IActivityLogItemProps } from '@erxes/ui-log/src/activityLogs/types';
import React from 'react';
import Tip from '@erxes/ui/src/components/Tip';
import dayjs from 'dayjs';
import { renderUserFullName } from '@erxes/ui/src/utils';

class CheckListItem extends React.Component<
  IActivityLogItemProps,
  { toggleItems: boolean }
> {
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
      userName = renderUserFullName(createdByDetail.content);
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
