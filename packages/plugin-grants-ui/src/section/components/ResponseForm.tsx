import React from 'react';
import {
  BarItems,
  Button,
  Form as CommonForm,
  ControlLabel,
  FormControl,
  FormGroup,
  Icon,
  __
} from '@erxes/ui/src';
import { IResponse } from '../containers/ResponseForm';

type Props = {
  closeModal: () => void;
  response: (props: IResponse) => void;
};

type State = {
  description: string;
  response?: 'approved' | 'declined';
};

class ResponseComponent extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      description: ''
    };

    this.renderContent = this.renderContent.bind(this);
  }

  renderContent() {
    const { response, description } = this.state;

    const handleResponse = (response: 'approved' | 'declined') => {
      this.props.response({ description, response });
    };

    const handleChange = e => {
      const { value } = e.currentTarget as HTMLInputElement;
      this.setState({ description: value });
    };

    return (
      <>
        <FormGroup>
          <ControlLabel>{__('Description')}</ControlLabel>
          <FormControl componentClass="textarea" onChange={handleChange} />
        </FormGroup>
        <BarItems>
          <Button btnStyle="danger" onClick={() => handleResponse('declined')}>
            {response === 'declined' && <Icon icon="check-1" />}
            {__('Decline')}
          </Button>
          <Button btnStyle="success" onClick={() => handleResponse('approved')}>
            {response === 'approved' && <Icon icon="check-1" />}
            {__('Approve')}
          </Button>
        </BarItems>
      </>
    );
  }

  render() {
    return <CommonForm renderContent={this.renderContent} />;
  }
}

export default ResponseComponent;
