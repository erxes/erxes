import { IItem, IOptions } from 'modules/boards/types';
import Button from 'modules/common/components/Button';
import FormControl from 'modules/common/components/form/Control';
import Form from 'modules/common/components/form/Form';
import ControlLabel from 'modules/common/components/form/Label';
import { Alert } from 'modules/common/utils';
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
  add: (doc: IChecklistDoc, callback: () => void) => void;
  closeModal: () => void;
};

type State = {
  disabled: boolean;
  title: string;
};

class AddForm extends React.Component<IProps, State> {
  constructor(props) {
    super(props);

    this.state = {
      disabled: false,
      title: ''
    };
  }

  onChangeTitle = e =>
    this.setState({ title: (e.currentTarget as HTMLInputElement).value });

  onSubmit = e => {
    e.preventDefault();

    const { title } = this.state;
    const { add, closeModal, options, item } = this.props;

    if (!title) {
      return Alert.error('Enter title');
    }

    // before save, disable save button
    this.setState({ disabled: true });

    const doc = {
      title,
      contentType: options.type,
      contentTypeId: item._id
    };

    add(doc, () => {
      // after save, enable save button
      this.setState({ disabled: false });

      closeModal();
    });
  };

  renderContent = () => {
    return (
      <AddContainer onSubmit={this.onSubmit}>
        <HeaderRow>
          <HeaderContent>
            <ControlLabel required={true}>Name</ControlLabel>
            <FormControl autoFocus={true} onChange={this.onChangeTitle} />
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
  };

  render() {
    return <Form renderContent={this.renderContent} />;
  }
}

export default AddForm;
