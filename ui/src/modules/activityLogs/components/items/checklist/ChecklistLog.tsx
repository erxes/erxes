import dayjs from 'dayjs';
import {
  ActivityDate,
  FlexBody,
  FlexCenterContent,
  Header,
  ShowMore
} from 'modules/activityLogs/styles';
import { IActivityLog } from 'modules/activityLogs/types';
import Tip from 'modules/common/components/Tip';
import React from 'react';
import CheckListItem from './ChecklistItem';

type Props = {
  activity: IActivityLog;
  checklistItemActivity: IActivityLog[];
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
    const { activity } = this.props;
    const {
      contentTypeDetail,
      content,
      action,
      contentType,
      createdByDetail,
      createdAt
    } = activity;

    let userName = 'Unknown';

    if (createdByDetail && createdByDetail.type === 'user') {
      if (createdByDetail.content.details) {
        userName = createdByDetail.content.details.fullName || 'Unknown';
      }
    }

    const checklistName = contentTypeDetail.title || content.name;

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
