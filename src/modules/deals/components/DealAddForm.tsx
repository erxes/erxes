import { Button, ControlLabel, FormControl } from 'modules/common/components';
import { Alert } from 'modules/common/utils';
import { __ } from 'modules/common/utils';
import {
  AddContainer,
  FormFooter,
  HeaderContent,
  HeaderRow
} from 'modules/deals/styles/deal';
import * as React from 'react';

type Props = {
  add: (name: string, callback: () => void) => void;
  closeModal: () => void;
};

type State = {
  name: string;
  disabled: boolean;
};

class DealAddForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      disabled: false,
      name: ''
    };
  }

  onChangeName = (e: React.FormEvent<HTMLElement>) => {
    this.setState({ name: (e.currentTarget as HTMLInputElement).value });
  };

  onSubmit = e => {
    e.preventDefault();

    const { name } = this.state;
    const { add, closeModal } = this.props;

    if (!name) {
      return Alert.error(__('Enter name'));
    }

    // before save, disable save button
    this.setState({ disabled: true });

    add(name, () => {
      // after save, enable save button
      this.setState({ disabled: false });

      closeModal();
    });
  };

  render() {
    return (
      <AddContainer onSubmit={this.onSubmit}>
        <HeaderRow>
          <HeaderContent>
            <ControlLabel required={true}>Name</ControlLabel>
            <FormControl autoFocus={true} onChange={this.onChangeName} />
          </HeaderContent>
        </HeaderRow>

        <FormFooter>
          <Button
            btnStyle="simple"
            onClick={this.props.closeModal}
            icon="cancel-1"
          >
            Close
          </Button>

          <Button
            disabled={this.state.disabled}
            btnStyle="success"
            icon="checked-1"
            type="submit"
          >
            Save
          </Button>
        </FormFooter>
      </AddContainer>
    );
  }
}

export default DealAddForm;
