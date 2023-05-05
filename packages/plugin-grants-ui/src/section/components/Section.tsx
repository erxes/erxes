import React from 'react';
import { IGrantRequest } from '../../common/section/type';
import { Box, Button, Icon, ModalTrigger } from '@erxes/ui/src';
import Form from '../containers/Form';

type Props = {
  request: IGrantRequest;
};

class Section extends React.Component<Props> {
  constructor(props) {
    super(props);
  }

  renderContent() {
    return <>divcx</>;
  }

  renderAddRequest() {
    const trigger = (
      <button>
        <Icon icon="plus-circle" />
      </button>
    );

    console.log('shit');

    const content = props => <Form {...props} />;

    return (
      <ModalTrigger
        title="Send Grant Request"
        trigger={trigger}
        content={content}
      />
    );
  }

  render() {
    return (
      <Box
        title="Grant Request"
        name="grantSection"
        extraButtons={this.renderAddRequest()}
      >
        {this.renderContent()}
      </Box>
    );
  }
}

export default Section;
