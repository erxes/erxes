import { MESSAGE_KINDS } from 'modules/engage/constants';
import { IBrand } from 'modules/settings/brands/types';
import React from 'react';
import { AutoAndManualForm, VisitorForm } from '../containers';
import { IEngageScheduleDate } from '../types';

type Props = {
  kind?: string;
  brands: IBrand[];
  scheduleDate?: IEngageScheduleDate;
};

class MessageForm extends React.Component<Props> {
  render() {
    const { kind } = this.props;

    if (kind === MESSAGE_KINDS.VISITOR_AUTO) {
      return <VisitorForm {...this.props} />;
    }

    return <AutoAndManualForm {...this.props} />;
  }
}

export default MessageForm;
