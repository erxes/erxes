import { MESSAGE_KINDS } from 'modules/engage/constants';
import { IBrand } from 'modules/settings/brands/types';
import React, { Component } from 'react';
import { AutoAndManualForm, VisitorForm } from '../containers';

type Props = {
  kind: string;
  brands: IBrand[];
  scheduleDate: any;
};

class MessageForm extends Component<Props> {
  render() {
    const { kind } = this.props;

    if (kind === MESSAGE_KINDS.VISITOR_AUTO) {
      return <VisitorForm {...this.props} />;
    }

    return <AutoAndManualForm {...this.props} />;
  }
}

export default MessageForm;
