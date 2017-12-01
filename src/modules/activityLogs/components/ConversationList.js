import React from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import { NameCard } from 'modules/common/components';
import {
  RowItem,
  SmallText,
  MessageContent,
  ConversationItems,
  CustomerName,
  FlexContent,
  RowContent,
  MainInfo
} from '../styles';

class ConversationList extends React.Component {
  renderFullName(customer) {
    if (customer.firstName || customer.lastName) {
      return (customer.firstName || '') + ' ' + (customer.lastName || '');
    }
    return customer.email || customer.phone;
  }

  renderRow(data) {
    const { list } = data;

    const { detail, history } = this.props;

    return list.map(item => {
      if (item.action !== 'conversation-create') return null;

      return (
        <RowItem
          key={item.id}
          onClick={() => {
            history.push(`/inbox?_id=${item.id}`);
          }}
        >
          <RowContent>
            {detail.__typename === 'Customer' ? (
              <NameCard.Avatar size={40} customer={detail} />
            ) : null}
            <MainInfo>
              <FlexContent>
                <CustomerName>
                  {detail.__typename === 'Customer'
                    ? this.renderFullName(detail)
                    : detail.name || 'N/A'}
                </CustomerName>
                <MessageContent>{item.content}</MessageContent>
              </FlexContent>
            </MainInfo>
          </RowContent>
          <SmallText>
            {moment(item.createdAt)
              .subtract(2, 'minutes')
              .fromNow()}
          </SmallText>
        </RowItem>
      );
    });
  }
  render() {
    const { activityLog } = this.props;

    return (
      <ConversationItems>
        {activityLog.map(item => this.renderRow(item))}
      </ConversationItems>
    );
  }
}

ConversationList.propTypes = {
  activityLog: PropTypes.array.isRequired,
  detail: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired
};

export default ConversationList;
