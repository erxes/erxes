import { TitleRow } from 'modules/boards/styles/item';
import { AddContainer } from 'modules/boards/styles/item';
import Button from 'modules/common/components/Button';
import { getMentionedUserIds } from 'modules/common/components/EditorCK';
import { FormControl } from 'modules/common/components/form';
import ControlLabel from 'modules/common/components/form/Label';
import Icon from 'modules/common/components/Icon';
import { __ } from 'modules/common/utils';
import React from 'react';
import {
  EditMutationVariables,
  IChecklist,
  IChecklistItem,
  IChecklistItemDoc,
  IChecklistsState
} from '../types';
import Item from './Item';

type Props = {
  list: IChecklist;
  edit: (doc: EditMutationVariables, callbak: () => void) => void;
  remove: (checklistId: string) => void;
  addItem: (doc: IChecklistItemDoc, callback: () => void) => void;
  editItem: (doc: IChecklistItem, callback: () => void) => void;
  removeItem: (checklistItemId: string) => void;
  onSelect: (checklistsState: IChecklistsState) => void;
  checklistsState: IChecklistsState;
};

type State = {
  isEditing: boolean;
  title: string;
  isAddItem: boolean;
  newItemContent: string;
  disabled: boolean;
  isHidden: boolean;
  checklistsState: IChecklistsState;
};

class List extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      isEditing: false,
      title: this.props.list.title,
      isAddItem: false,
      newItemContent: '',
      disabled: false,
      isHidden: false,
      checklistsState: props.checklistsState || { complete: 0, all: 0 }
    };
  }

  renderItems = checklist => {
    if (!checklist.items) {
      return null;
    }

    return (
      <>
        {checklist.items.map(item => {
          return (
            <TitleRow key={item._id}>
              <Item
                key={item._id}
                item={item}
                isHidden={this.state.isHidden}
                editItem={this.props.editItem}
                removeItem={this.props.removeItem}
                onSelect={this.props.onSelect}
                checklistsState={this.props.checklistsState}
              />
            </TitleRow>
          );
        })}
      </>
    );
  };

  renderTitle = () => {
    const { remove, list } = this.props;
    const { isEditing, title, isHidden } = this.state;

    if (isEditing) {
      return null;
    }

    const onClick = () => {
      this.setState({ isEditing: true });
    };

    const renderHideButton = () => {
      if (!list.percent) {
        return null;
      }

      if (isHidden) {
        return (
          <Button btnStyle="simple" onClick={showClick}>
            {__(`Show checked items`)}
          </Button>
        );
      } else {
        return (
          <Button btnStyle="simple" onClick={hideClick}>
            {__(`Hide completed items`)}
          </Button>
        );
      }
    };

    const hideClick = () => {
      this.setState({ isHidden: true });
    };

    const showClick = () => {
      this.setState({ isHidden: false });
    };

    const removeClick = () => remove(list._id);

    return (
      <>
        <ControlLabel>
          <label onClick={onClick}>{title}</label>
        </ControlLabel>
        {renderHideButton()}
        <Button btnStyle="simple" onClick={removeClick}>
          <Icon icon="cancel-1" />
        </Button>
      </>
    );
  };

  renderInput = () => {
    const { isEditing, title } = this.state;

    if (!isEditing) {
      return null;
    }

    const onChangeTitle = e =>
      this.setState({ title: (e.currentTarget as HTMLInputElement).value });

    const isEditingChange = () => this.setState({ isEditing: false });

    const onSubmit = e => {
      e.preventDefault();
      const { edit, list } = this.props;

      // before save, disable save button
      this.setState({ disabled: true });

      const doc = {
        _id: list._id,
        title,
        contentType: list.contentType,
        contentTypeId: list.contentTypeId
      };

      edit(doc, () => {
        // after save, enable save button
        this.setState({ disabled: false });

        isEditingChange();
      });
    };

    return (
      <AddContainer onSubmit={onSubmit}>
        <FormControl autoFocus={true} onChange={onChangeTitle} value={title} />
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

  renderAddItemBtn = () => {
    const { isAddItem } = this.state;

    if (isAddItem) {
      return null;
    }

    const onClick = () => {
      this.setState({ isAddItem: true });
    };

    return (
      <button onClick={onClick}>
        <Icon icon="focus-add" />
        {__('Add item')}
      </button>
    );
  };

  renderAddItem = () => {
    const { isAddItem, newItemContent } = this.state;
    if (!isAddItem) {
      return null;
    }

    const onChangeContent = e =>
      this.setState({
        newItemContent: (e.currentTarget as HTMLInputElement).value
      });

    const isAddItemChange = () => this.setState({ isAddItem: false });

    const onSubmit = e => {
      e.preventDefault();
      const { addItem, list } = this.props;

      // before save, disable save button
      this.setState({ disabled: true });

      const mentionedUserIds = getMentionedUserIds(newItemContent);

      const doc = {
        checklistId: list._id,
        content: newItemContent,
        isChecked: false,
        mentionedUserIds
      };

      addItem(doc, () => {
        // after save, enable save button
        this.setState({ disabled: false });

        isAddItemChange();
      });

      this.setState({
        checklistsState: {
          complete: this.state.checklistsState.complete,
          all: this.state.checklistsState.all + 1
        }
      });
      this.props.onSelect(this.state.checklistsState);
      // this.props.onSelect({complete: this.props.checklistsState.complete, all: this.props.checklistsState.all + 1});
    };

    return (
      <AddContainer onSubmit={onSubmit}>
        <FormControl autoFocus={true} onChange={onChangeContent} />
        <Button btnStyle="simple" onClick={isAddItemChange} icon="cancel-1">
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
      </AddContainer>
    );
  };

  render() {
    const { list } = this.props;

    return (
      <>
        <TitleRow>
          <Icon icon="checked" />
          {this.renderTitle()}
          {this.renderInput()}
        </TitleRow>
        <TitleRow>
          <ControlLabel>{__(`${list.percent.toFixed(2)} %`)}</ControlLabel>
        </TitleRow>
        {this.renderItems(list)}
        <TitleRow>
          {this.renderAddItemBtn()}
          {this.renderAddItem()}
        </TitleRow>
      </>
    );
  }
}

export default List;
