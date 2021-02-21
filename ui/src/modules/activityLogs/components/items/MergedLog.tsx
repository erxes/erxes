import dayjs from 'dayjs';
import {
  ActivityDate,
  FlexCenterContent,
  MergedContacts
} from 'modules/activityLogs/styles';
import { IActivityLogItemProps } from 'modules/activityLogs/types';
import Tip from 'modules/common/components/Tip';
import { __, renderFullName, renderUserFullName } from 'modules/common/utils';
import React from 'react';
import { Link } from 'react-router-dom';

class MergedLog extends React.Component<IActivityLogItemProps> {
  renderCreatedBy = () => {
    const { createdByDetail } = this.props.activity;

    if (createdByDetail) {
      const userName = renderUserFullName(createdByDetail.content);

      return <strong>{userName}</strong>;
    }

    return <strong>System</strong>;
  };

  renderContent = () => {
    const { contentType, contentDetail } = this.props.activity;
    const type = contentType.includes('customer') ? 'customers' : 'companies';

    return (
      <>
        {this.renderCreatedBy()}&nbsp;
        {__('merged')}
        {contentDetail.length !== 0 &&
          contentDetail.map(contact => {
            return (
              <Link
                key={contact._id}
                to={`/contacts/${type}/details/${contact._id}`}
                target="_blank"
              >
                &nbsp;
                {renderFullName(contact)}
              </Link>
            );
          })}
        &nbsp;{type}
      </>
    );
  };

  render() {
    const { createdAt } = this.props.activity;

    return (
      <>
        <FlexCenterContent>
          <MergedContacts>{this.renderContent()}</MergedContacts>
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

export default MergedLog;
