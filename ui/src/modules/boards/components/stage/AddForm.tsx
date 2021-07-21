import Button from 'modules/common/components/Button';
import FormControl from 'modules/common/components/form/Control';
import ControlLabel from 'modules/common/components/form/Label';
import { Alert } from 'modules/common/utils';
import React from 'react';
import { FormFooter, HeaderContent, HeaderRow } from '../../styles/item';
import { invalidateCache } from '../../utils';

type Props = {
  add: (name: string, callback: () => void) => void;
  closeModal: () => void;
};

type State = {
  name: string;
  disabled: boolean;
};

class AddForm extends React.Component<Props, State> {
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
      return Alert.error('Enter name');
    }

    // before save, disable save button
    this.setState({ disabled: true });

    add(name, () => {
      // after save, enable save button
      this.setState({ disabled: false });

      closeModal();

      invalidateCache();
    });
  };

  render() {
    return (
      <form onSubmit={this.onSubmit}>
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
            icon="times-circle"
          >
            Close
          </Button>

          <Button
            disabled={this.state.disabled}
            btnStyle="success"
            icon="check-circle"
            type="submit"
          >
            Save
          </Button>
        </FormFooter>
      </form>
    );
  }
}

export default AddForm;
