import dayjs from 'dayjs';
import {
  ActivityDate,
  FlexCenterContent,
  MergedContacts
} from 'modules/activityLogs/styles';
import { IActivityLog } from 'modules/activityLogs/types';
import Tip from 'modules/common/components/Tip';
import { __ } from 'modules/common/utils';
import React from 'react';
import { Link } from 'react-router-dom';

type Props = {
  activity: IActivityLog;
};

class MergedLog extends React.Component<Props> {
  renderContent = () => {
    const { contentType, createdByDetail, contentDetail } = this.props.activity;
    const type = contentType.includes('customer') ? 'customers' : 'companies';

    return (
      <>
        <strong>
          {createdByDetail.details
            ? createdByDetail.details.fullName
            : 'Unknown'}
        </strong>{' '}
        {__('merged')}
        {contentDetail.length !== 0 &&
          contentDetail.map(contact => {
            const {
              firstName,
              visitorContactInfo,
              primaryName,
              primaryPhone,
              _id
            } = contact;

            return (
              <Link
                key={contact._id}
                to={`/contacts/${type}/details/${contact._id}`}
                target="_blank"
              >
                &nbsp;
                {firstName ||
                  primaryName ||
                  primaryPhone ||
                  (visitorContactInfo && visitorContactInfo.email) ||
                  (visitorContactInfo && visitorContactInfo.phone) ||
                  _id}
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
