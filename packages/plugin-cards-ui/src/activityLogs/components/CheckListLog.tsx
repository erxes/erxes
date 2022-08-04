import {
  ActivityDate,
  FlexBody,
  FlexCenterContent,
  Header,
  ShowMore
} from '@erxes/ui-log/src/activityLogs/styles';

import CheckListItem from './ChecklistItem';
import { IActivityLog } from '@erxes/ui-log/src/activityLogs/types';
import { IChecklist } from '@erxes/ui-cards/src/checklists/types';
import React from 'react';
import Tip from '@erxes/ui/src/components/Tip';
import dayjs from 'dayjs';
import { renderUserFullName } from '@erxes/ui/src/utils';

type Props = {
  activity: IActivityLog;
  checklistItemActivity: IActivityLog[];
  checkListDetail: IChecklist;
};

class ChecklistLog extends React.Component<Props, { toggleItems: boolean }> {
  constructor(props) {
    super(props);

    this.state = {
      toggleItems: false
    };
  }

  onCollapse = () => {
    this.setState({ toggleItems: !this.state.toggleItems });
  };

  renderItem = () => {
    const { checklistItemActivity } = this.props;

    const rows: React.ReactNode[] = [];

    checklistItemActivity.forEach(acitivity => {
      rows.push(<CheckListItem key={Math.random()} activity={acitivity} />);
    });

    return rows;
  };

  render() {
    const { activity, checkListDetail } = this.props;
    const { action, contentType, createdByDetail, createdAt } = activity;

    let userName = 'Unknown';

    console.log(activity, createdByDetail, 'sadasd');

    if (createdByDetail && createdByDetail.type === 'user') {
      const createdByDetailContent = createdByDetail.content
        ? createdByDetail.content
        : {};

      if (createdByDetailContent && createdByDetailContent.details) {
        userName = renderUserFullName(createdByDetail.content);
      }
    }

    const checklistName = checkListDetail.title;

    if (this.state.toggleItems) {
      return (
        <>
          <Header>
            <strong>{checklistName}</strong>`s details{' '}
            <ShowMore onClick={this.onCollapse}>hide</ShowMore>
          </Header>

          {this.renderItem()}
        </>
      );
    }

    return (
      <>
        <FlexCenterContent>
          <FlexBody>
            {' '}
            <span>
              <strong>{userName}</strong> {action}d&nbsp;
              <strong>{checklistName}</strong> {contentType}&nbsp;
              <ShowMore onClick={this.onCollapse}>show details</ShowMore>
            </span>
          </FlexBody>
          <Tip text={dayjs(createdAt).format('llll')}>
            <ActivityDate>
              {dayjs(createdAt).format('MMM D, h:mm A')}
            </ActivityDate>
          </Tip>
        </FlexCenterContent>
      </>
    );
  }
}

export default ChecklistLog;
