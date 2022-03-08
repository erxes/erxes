import { MESSAGE_KINDS } from '@erxes/ui-engage/src/constants';
import React from 'react';
import AutoAndManualForm from '../containers/AutoAndManualForm';
import VisitorForm from '../containers/VisitorForm';
import { IEngageScheduleDate } from '@erxes/ui-engage/src/types';
import { IBrand } from '@erxes/ui/src/brands/types';

type Props = {
  kind?: string;
  brands: IBrand[];
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
