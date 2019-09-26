import {
  AddContainer,
  FormFooter,
  HeaderContent,
  HeaderRow,
  TitleRow
} from 'modules/boards/styles/item';
import Button from 'modules/common/components/Button';
import { ControlLabel, FormControl } from 'modules/common/components/form';
import Icon from 'modules/common/components/Icon';
import { __ } from 'modules/common/utils';
import React from 'react';
import { IChecklistItem } from '../types';

type Props = {
  item: IChecklistItem;
  editItem: (doc: IChecklistItem, callback: () => void) => void;
  removeItem: (checklistItemId: string) => void;
};

type State = {
  isEditing: boolean;
  content: string;
  disabled: boolean;
};

class Checklists extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      isEditing: false,
      content: props.item.content,
      disabled: false
    };
  }

  renderContent = () => {
    const { removeItem, item } = this.props;
    const { isEditing, content } = this.state;

    if (isEditing) {
      return null;
    }

    const onClick = () => {
      this.setState({ isEditing: true });
    };

    const removeClick = () => removeItem(item._id);

    return (
      <>
        <ControlLabel>
          <label onClick={onClick}>{__(`${content}`)}</label>
        </ControlLabel>
        <button onClick={removeClick}>
          <Icon icon="cancel" />
        </button>
      </>
    );
  };

  renderInput = () => {
    const { isEditing, content } = this.state;

    if (!isEditing) {
      return null;
    }

    const onChangecontent = e =>
      this.setState({ content: (e.currentTarget as HTMLInputElement).value });

    const isEditingChange = () => this.setState({ isEditing: false });

    const onSubmit = e => {
      e.preventDefault();
      const { editItem, item } = this.props;

      // before save, disable save button
      this.setState({ disabled: true });

      const doc = {
        _id: item._id,
        checklistId: item.checklistId,
        content,
        isChecked: item.isChecked
      };

      editItem(doc, () => {
        // after save, enable save button
        this.setState({ disabled: false });

        isEditingChange();
      });
    };

    return (
      <AddContainer onSubmit={onSubmit}>
        <HeaderRow>
          <HeaderContent>
            <FormControl
              autoFocus={true}
              onChange={onChangecontent}
              value={content}
            />
          </HeaderContent>
        </HeaderRow>
        <FormFooter>
          <Button btnStyle="simple" onClick={isEditingChange} icon="cancel-1">
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

  render = () => {
    const { item } = this.props;
    const { content } = this.state;

    return (
      <TitleRow>
        <FormControl
          componentClass="checkbox"
          checked={item.isChecked}
          value="{item.content}"
          placeholder={content}
        />
        <TitleRow>
          <Icon icon="checked" />
          {this.renderContent()}
          {this.renderInput()}
        </TitleRow>
      </TitleRow>
    );
  };
}

export default Checklists;
