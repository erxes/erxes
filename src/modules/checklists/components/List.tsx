import { TitleRow } from 'modules/boards/styles/item';
import Button from 'modules/common/components/Button';
import { FormControl } from 'modules/common/components/form';
import ControlLabel from 'modules/common/components/form/Label';
import Icon from 'modules/common/components/Icon';
import { __ } from 'modules/common/utils';
import React from 'react';
import xss from 'xss';
import EditorCK from '../../common/containers/EditorCK';
import { AddContainer } from '../styles/item';
import {
  EditMutationVariables,
  IChecklist,
  IChecklistItem,
  IChecklistItemDoc
} from '../types';
import Item from './Item';

type Props = {
  list: IChecklist;
  edit: (doc: EditMutationVariables, callbak: () => void) => void;
  remove: (checklistId: string) => void;
  addItem: (doc: IChecklistItemDoc, callback: () => void) => void;
  editItem: (doc: IChecklistItem, callback: () => void) => void;
  removeItem: (checklistItemId: string) => void;
};

type State = {
  isEditing: boolean;
  title: string;
  isAddItem: boolean;
  newItemContent: string;
  disabled: boolean;
};

class List extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      isEditing: false,
      title: this.props.list.title,
      isAddItem: false,
      newItemContent: '',
      disabled: false
    };
  }

  renderChecklistItems = checklist => {
    if (!checklist.checklistItems) {
      return null;
    }

    return (
      <>
        {checklist.checklistItems.map(item => {
          return (
            <TitleRow key={item._id}>
              <Item
                key={item._id}
                item={item}
                editItem={this.props.editItem}
                removeItem={this.props.removeItem}
              />
            </TitleRow>
          );
        })}
      </>
    );
  };

  renderTitle = () => {
    const { remove, list } = this.props;
    const { isEditing, title } = this.state;

    if (isEditing) {
      return null;
    }

    const onClick = () => {
      this.setState({ isEditing: true });
    };

    const removeClick = () => remove(list._id);

    return (
      <>
        <ControlLabel>
          <label
            onClick={onClick}
            dangerouslySetInnerHTML={{ __html: xss(title) }}
          />
        </ControlLabel>
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
        newItemContent: e.editor.getData()
      });

    const isAddItemChange = () => this.setState({ isAddItem: false });

    const onSubmit = e => {
      e.preventDefault();
      const { addItem, list } = this.props;

      // before save, disable save button
      this.setState({ disabled: true });

      const doc = {
        checklistId: list._id,
        content: newItemContent,
        isChecked: false
      };

      addItem(doc, () => {
        // after save, enable save button
        this.setState({ disabled: false });

        isAddItemChange();
      });
    };

    return (
      <AddContainer onSubmit={onSubmit}>
        <EditorCK
          showMentions={true}
          content=""
          onChange={onChangeContent}
          height={100}
          toolbar={[]}
          toolbarCanCollapse={false}
        />
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
          <ControlLabel>
            {__(`${list.checklistPercent.toFixed(2)}`)} %
          </ControlLabel>
        </TitleRow>
        {this.renderChecklistItems(list)}
        <TitleRow>
          {this.renderAddItemBtn()}
          {this.renderAddItem()}
        </TitleRow>
      </>
    );
  }
}

export default List;
