import dayjs from 'dayjs';
import {
  ActivityDate,
  FlexBody,
  FlexCenterContent,
  Header,
  ShowMore
} from '@erxes/ui/src/activityLogs/styles';
import { IActivityLog } from '@erxes/ui/src/activityLogs/types';
import Tip from '@erxes/ui/src/components/Tip';
import { renderUserFullName } from '@erxes/ui/src/utils';
import React from 'react';
import CheckListItem from './ChecklistItem';
import { IChecklist } from '@erxes/ui-cards/src/checklists/types';

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
      const createdByDetailContent = (createdByDetail.content = {} as any);

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
