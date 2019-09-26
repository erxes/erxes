import {
  FormFooter,
  HeaderContent,
  HeaderRow,
  TitleRow
} from 'modules/boards/styles/item';
import Button from 'modules/common/components/Button';
import { FormControl } from 'modules/common/components/form';
import ControlLabel from 'modules/common/components/form/Label';
import Icon from 'modules/common/components/Icon';
import { __ } from 'modules/common/utils';
import React from 'react';
import { AddContainer } from '../styles/item';
import { EditMutationVariables, IChecklist, IChecklistItemDoc } from '../types';
import Item from './Item';

type Props = {
  list: IChecklist;
  edit: (doc: EditMutationVariables, callbak: () => void) => void;
  remove: (checklistId: string) => void;
  addItem: (doc: IChecklistItemDoc, callback: () => void) => void;
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
            <>
              <Item
                key={item._id}
                item={item}
                removeItem={this.props.removeItem}
              />
            </>
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
          <label onClick={onClick}>{__(`${title}`)}</label>
        </ControlLabel>
        <button onClick={removeClick}>
          <Icon icon="cancel" />
        </button>
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
        <HeaderRow>
          <HeaderContent>
            <FormControl
              autoFocus={true}
              onChange={onChangeTitle}
              value={title}
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
        <HeaderRow>
          <HeaderContent>
            <FormControl
              autoFocus={true}
              onChange={onChangeContent}
              placeholder="Add Item"
            />
          </HeaderContent>
        </HeaderRow>
        <FormFooter>
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
        </FormFooter>
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
          <ControlLabel>{__(`${list.checklistPercent}`)}</ControlLabel>
        </TitleRow>
        <TitleRow>{this.renderChecklistItems(list)}</TitleRow>
        <TitleRow>
          {this.renderAddItemBtn()}
          {this.renderAddItem()}
        </TitleRow>
      </>
    );
  }
}

export default List;
