import { MESSAGE_KINDS } from '../constants';
import React from 'react';
import AutoAndManualForm from '../containers/AutoAndManualForm';
import VisitorForm from '../containers/VisitorForm';
import { IEngageScheduleDate } from '../types';

type Props = {
  kind?: string;
  brands: any[];
  scheduleDate?: IEngageScheduleDate;
  segmentType?: string;
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
