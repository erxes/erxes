import React, { Component } from 'react';
import { ConversationItem } from 'modules/inbox/components/leftSidebar';

export default class ConversationItemContainer extends Component {
  render() {
    return <ConversationItem {...this.props} />;
  }
}
