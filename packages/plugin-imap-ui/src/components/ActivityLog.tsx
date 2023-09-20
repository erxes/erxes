import { ActivityIcon, ActivityRow } from '../styles';

import Icon from '@erxes/ui/src/components/Icon';
import React from 'react';
import Tip from '@erxes/ui/src/components/Tip';
import { getIconAndColor } from '@erxes/ui-log/src/activityLogs/utils';

type Props = {
  contentType: string;
  activity: any;
  currentUser: any;
};

class ActivityItem extends React.Component<Props> {
  render() {
    const { activity } = this.props;
    const { contentTypeDetail } = activity;
    const { body, subject } = contentTypeDetail;

    const iconAndColor = getIconAndColor('email');

    return (
      <ActivityRow>
        <Tip text={'imap email'} placement="top">
          <ActivityIcon color={iconAndColor.color}>
            <Icon icon={iconAndColor.icon} />
          </ActivityIcon>
        </Tip>

        <span>
          <strong>Sent an email</strong>
        </span>

        <p>
          <span>Subject:</span>
          <div>{subject}</div>
        </p>

        <p>
          <span>Content:</span>
          <div dangerouslySetInnerHTML={{ __html: body }} />
        </p>
      </ActivityRow>
    );
  }
}

export default ActivityItem;
