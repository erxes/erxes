import { AddContainer } from 'modules/boards/styles/item';
import Button from 'modules/common/components/Button';
import { getMentionedUserIds } from 'modules/common/components/EditorCK';
import { ControlLabel, FormControl } from 'modules/common/components/form';
import Icon from 'modules/common/components/Icon';
import React from 'react';
import xss from 'xss';
import { IChecklistItem, IChecklistsState } from '../types';

type Props = {
  item: IChecklistItem;
  isHidden: boolean;
  editItem: (doc: IChecklistItem, callback: () => void) => void;
  removeItem: (checklistItemId: string) => void;
  onSelect: (checklistsState: IChecklistsState) => void;
  checklistsState: IChecklistsState;
};

type State = {
  isEditing: boolean;
  content: string;
  disabled: boolean;
  isChecked: boolean;
  checklistsState: IChecklistsState;
};

class Checklists extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      isEditing: false,
      content: props.item.content,
      disabled: false,
      isChecked: props.item.isChecked,
      checklistsState: props.checklistsState || { complete: 0, all: 0 }
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

    const removeClick = () => {
      removeItem(item._id);

      this.setState({
        checklistsState: {
          complete: this.state.checklistsState.complete,
          all: this.state.checklistsState.all - 1
        }
      });
      this.props.onSelect(this.state.checklistsState);
      // this.props.onSelect({complete: this.props.checklistsState.complete, all: this.props.checklistsState.all - 1});
    };

    return (
      <>
        <ControlLabel>
          <label
            onClick={onClick}
            dangerouslySetInnerHTML={{ __html: xss(content) }}
          />
        </ControlLabel>
        <Button btnStyle="simple" onClick={removeClick}>
          <Icon icon="cancel-1" />
        </Button>
      </>
    );
  };

  renderInput = () => {
    const { isEditing, content } = this.state;

    if (!isEditing) {
      return null;
    }

    const onChangeContent = e => {
      this.setState({
        content: (e.currentTarget as HTMLInputElement).value
      });
    };

    const isEditingChange = () => this.setState({ isEditing: false });

    const onSubmit = e => {
      e.preventDefault();
      const { editItem, item } = this.props;

      // before save, disable save button
      this.setState({ disabled: true });

      const mentionedUserIds = getMentionedUserIds(content);

      const doc = {
        _id: item._id,
        checklistId: item.checklistId,
        content,
        isChecked: item.isChecked,
        mentionedUserIds
      };

      editItem(doc, () => {
        // after save, enable save button
        this.setState({ disabled: false });

        isEditingChange();
      });
    };

    return (
      <AddContainer onSubmit={onSubmit}>
        <FormControl
          autoFocus={true}
          onChange={onChangeContent}
          value={this.state.content}
        />
        <Button btnStyle="simple" onClick={isEditingChange}>
          <Icon icon="cancel" />
        </Button>

        <Button
          disabled={this.state.disabled}
          btnStyle="success"
          icon="checked-1"
          type="submit"
        >
          Save
        </Button>
      </AddContainer>
    );
  };

  onCheckChange = e => {
    const { editItem, item } = this.props;

    const checked = (e.currentTarget as HTMLInputElement).checked;

    const doc = {
      _id: item._id,
      checklistId: item.checklistId,
      content: item.content,
      isChecked: checked
    };

    editItem(doc, () => {
      this.setState({ isChecked: checked });
    });

    const complete = this.props.checklistsState.complete;
    this.setState({
      checklistsState: {
        complete: checked ? complete + 1 : complete - 1,
        all: this.state.checklistsState.all
      }
    });
    this.props.onSelect(this.state.checklistsState);

    // this.props.onSelect({complete: checked ? complete + 1: complete -1, all: this.props.checklistsState.all});
  };

  render = () => {
    const { isHidden, item } = this.props;

    if (isHidden && item.isChecked) {
      return null;
    }

    const { content, isChecked } = this.state;

    return (
      <>
        <FormControl
          componentClass="checkbox"
          checked={isChecked}
          placeholder={content}
          onChange={this.onCheckChange}
        />
        {this.renderContent()}
        {this.renderInput()}
      </>
    );
  };
}

export default Checklists;
