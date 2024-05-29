import React from 'react';
import AutoAndManualForm from '../containers/AutoAndManualForm';
import { IBrand } from '@erxes/ui/src/brands/types';

type Props = {
  kind?: string;
  brands: IBrand[];
  segmentType?: string;
};

class MessageForm extends React.Component<Props> {
  render() {
    return <AutoAndManualForm {...this.props} />;
  }
}

export default MessageForm;
