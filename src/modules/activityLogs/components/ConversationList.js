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
    return 'N/A';
  }

  renderRow(data) {
    const { list } = data;

    const { customer, history } = this.props;

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
            <NameCard.Avatar size={40} customer={customer} />
            <MainInfo>
              <FlexContent>
                <CustomerName>
                  {this.renderFullName(customer) ||
                    customer.email ||
                    customer.phone}
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
  customer: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired
};

export default ConversationList;
