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

    this.onSubmit = this.onSubmit.bind(this);
    this.onChangeName = this.onChangeName.bind(this);

    this.state = {
      disabled: false,
      name: ''
    };
  }

  onChangeName(e: React.FormEvent<HTMLElement>) {
    this.setState({ name: (e.currentTarget as HTMLInputElement).value });
  }

  onSubmit(e) {
    e.preventDefault();

    const { name } = this.state;
    const { add, closeModal } = this.props;

    if (!name) return Alert.error(__('Enter name'));

    // before save, disable save button
    this.setState({ disabled: true });

    add(name, () => {
      // after save, enable save button
      this.setState({ disabled: false });

      closeModal();
    });
  }

  render() {
    return (
      <AddContainer onSubmit={e => this.onSubmit(e)}>
        <HeaderRow>
          <HeaderContent>
            <ControlLabel>Name</ControlLabel>
            <FormControl autoFocus onChange={this.onChangeName} />
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
