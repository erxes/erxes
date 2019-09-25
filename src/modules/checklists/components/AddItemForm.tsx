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
import { IChecklist, IChecklistItemDoc } from '../types';

type IProps = {
  checklist: IChecklist;
  add: (doc: IChecklistItemDoc, callback: () => void) => void;
  // saveItem: () => void;
  closeModal: () => void;
};

type State = {
  disabled: boolean;
  content: string;
};

class AddItemForm extends React.Component<IProps, State> {
  constructor(props) {
    super(props);

    this.state = {
      disabled: false,
      content: ''
    };
  }

  onChangeContent = e =>
    this.setState({ content: (e.currentTarget as HTMLInputElement).value });

  onSubmit = e => {
    e.preventDefault();

    const { content } = this.state;
    const { add, closeModal, checklist } = this.props;

    if (!content) {
      return Alert.error('Enter content');
    }

    // before save, disable save button
    this.setState({ disabled: true });

    const doc = {
      content,
      checklistId: checklist._id,
      isChecked: false,
      mentionedUserIds: []
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
            <FormControl autoFocus={true} onChange={this.onChangeContent} />
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

export default AddItemForm;
