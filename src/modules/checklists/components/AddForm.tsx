import { IItem, IOptions } from 'modules/boards/types';
import Button from 'modules/common/components/Button';
import FormControl from 'modules/common/components/form/Control';
import ControlLabel from 'modules/common/components/form/Label';
import { __ } from 'modules/common/utils';
import * as React from 'react';
import {
  AddContainer,
  FormFooter,
  HeaderContent,
  HeaderRow
} from '../styles/item';
import { IChecklistDoc } from '../types';

type IProps = {
  item: IItem;
  options: IOptions;
  saveItem: (doc: IChecklistDoc) => void;
  closeModal: () => void;
};

type State = {
  disabled: false;
  title: string;
};

class AddForm extends React.Component<IProps, State> {
  onChangeField = <T extends keyof State>(name: T, value: State[T]) => {
    this.setState(({ [name]: value } as unknown) as Pick<State, keyof State>);
  };

  onChangeName = e =>
    this.onChangeField('title', (e.target as HTMLInputElement).value);

  save = e => {
    e.preventDefault();

    const { title } = this.state;
    const { item, options, saveItem, closeModal } = this.props;

    const doc = {
      title,
      contentType: options.type,
      contentTypeId: item._id
    };

    // before save, disable save button
    // this.setState({ disabled: true });

    saveItem(doc);
    // after save, enable save button
    this.setState({ disabled: false });

    closeModal();
  };

  render() {
    const { item, options } = this.props;
    return (
      <AddContainer onSubmit={this.save}>
        <HeaderRow>
          <HeaderContent>
            <ControlLabel required={true}>Title</ControlLabel>
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

export default AddForm;
