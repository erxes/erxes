import Button from 'modules/common/components/Button';
import { getMentionedUserIds } from 'modules/common/components/EditorCK';
import { FormControl } from 'modules/common/components/form';
import Icon from 'modules/common/components/Icon';
import ProgressBar from 'modules/common/components/ProgressBar';
import colors from 'modules/common/styles/colors';
import { __ } from 'modules/common/utils';
import React from 'react';
import {
  AddItem,
  ChecklistActions,
  ChecklistTitle,
  ChecklistTitleWrapper,
  ChecklistWrapper,
  Progress
} from '../styles';
import {
  EditMutationVariables,
  IChecklist,
  IChecklistItem,
  IChecklistItemDoc,
  IChecklistsState,
  UpdateOrderItemsVariables
} from '../types';
import Item from './Item';

type Props = {
  list: IChecklist;
  edit: (doc: EditMutationVariables, callbak: () => void) => void;
  remove: (checklistId: string, callback: () => void) => void;
  addItem: (doc: IChecklistItemDoc, callback: () => void) => void;
  editItem: (doc: IChecklistItem, callback: () => void) => void;
  updateOrder: (doc: [UpdateOrderItemsVariables]) => void;
  removeItem: (checklistItemId: string, callback: () => void) => void;
  onSelect: (checklistsState: IChecklistsState) => void;
  checklistsState: IChecklistsState;
};

type State = {
  items: IChecklistItem[];
  showedItems: IChecklistItem[];
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
      items: this.props.list.items,
      showedItems: this.props.list.items,
      isEditing: false,
      title: this.props.list.title,
      isAddItem: false,
      newItemContent: '',
      disabled: false,
      isHidden: false,
      checklistsState: props.checklistsState || { complete: 0, all: 0 }
    };
  }

  setChecklistState = (diffComplete: number, diffAll: number) => {
    this.setState({
      checklistsState: { complete: +diffComplete, all: +diffAll }
    });
    this.props.onSelect(this.state.checklistsState);
  };

  renderItems = () => {
    const { showedItems } = this.state;
    if (showedItems.length === 0) {
      return null;
    }

    return showedItems.map(showedItem => (
      <Item
        key={showedItem._id}
        item={showedItem}
        editItem={this.props.editItem}
        removeItem={this.props.removeItem}
        setChecklistState={this.setChecklistState}
      />
    ));
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
          <Button btnStyle="simple" size="small" onClick={showClick}>
            {__(`Show checked items`)}
          </Button>
        );
      } else {
        return (
          <Button btnStyle="simple" size="small" onClick={hideClick}>
            {__(`Hide completed items`)}
          </Button>
        );
      }
    };

    const hideClick = () => {
      this.setState({ isHidden: true });
      this.setState({
        showedItems: this.state.items.filter(item => !item.isChecked)
      });
    };

    const showClick = () => {
      this.setState({ isHidden: false });
      this.setState({
        showedItems: this.state.items.sort((a, b) =>
          a.order < b.order ? -1 : 1
        )
      });
    };

    const removeClick = () => {
      remove(list._id, () => {
        this.setChecklistState(
          -this.state.items.filter(item => item.isChecked).length,
          -this.state.items.length
        );
      });
    };

    return (
      <ChecklistTitle>
        <h5 onClick={onClick}>{title}</h5>
        <ChecklistActions>
          {renderHideButton()}
          <Button btnStyle="simple" size="small" onClick={removeClick}>
            Delete
          </Button>
        </ChecklistActions>
      </ChecklistTitle>
    );
  };

  renderInput = () => {
    const { isEditing, title } = this.state;

    if (!isEditing) {
      return null;
    }

    const onChangeTitle = e =>
      this.setState({ title: (e.currentTarget as HTMLTextAreaElement).value });

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
      <AddItem onSubmit={onSubmit}>
        <FormControl
          autoFocus={true}
          componentClass="textarea"
          onChange={onChangeTitle}
          value={title}
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
      </AddItem>
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
      <Button size="small" btnStyle="simple" onClick={onClick}>
        <Icon icon="focus-add" />
        {__(' Add an item')}
      </Button>
    );
  };

  renderAddItem = () => {
    const { isAddItem, newItemContent, items } = this.state;
    if (!isAddItem) {
      return null;
    }

    const onChangeContent = e =>
      this.setState({
        newItemContent: (e.currentTarget as HTMLTextAreaElement).value
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
        mentionedUserIds,
        order: items.length
      };

      addItem(doc, () => {
        // after save, enable save button
        this.setState({ disabled: false });

        isAddItemChange();
      });

      this.setChecklistState(0, 1);
    };

    return (
      <AddItem isNewItem={true} onSubmit={onSubmit}>
        <FormControl
          autoFocus={true}
          componentClass="textarea"
          onChange={onChangeContent}
        />
        <Button
          btnStyle="simple"
          size="small"
          onClick={isAddItemChange}
          icon="cancel-1"
        >
          Close
        </Button>

        <Button
          disabled={this.state.disabled}
          btnStyle="success"
          icon="checked-1"
          type="submit"
          size="small"
        >
          Save
        </Button>
      </AddItem>
    );
  };

  render() {
    const { list } = this.props;
    return (
      <>
        <ChecklistTitleWrapper>
          <Icon icon="checked" />
          {this.renderTitle()}
          {this.renderInput()}
        </ChecklistTitleWrapper>

        <Progress>
          <span>{list.percent.toFixed(0)}%</span>
          <ProgressBar
            percentage={list.percent}
            color={colors.colorPrimary}
            height="8px"
          />
        </Progress>

        <ChecklistWrapper>
          {this.renderItems()}
          {this.renderAddItemBtn()}
          {this.renderAddItem()}
        </ChecklistWrapper>
      </>
    );
  }
}

export default List;
