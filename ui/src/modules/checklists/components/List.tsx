import debounce from 'lodash/debounce';
import Button from 'modules/common/components/Button';
import { Form, FormControl } from 'modules/common/components/form';
import Icon from 'modules/common/components/Icon';
import ProgressBar from 'modules/common/components/ProgressBar';
import SortableList from 'modules/common/components/SortableList';
import colors from 'modules/common/styles/colors';
import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import { __, isEmptyContent } from 'modules/common/utils';
import React, { useEffect, useState } from 'react';
import Item from '../containers/Item';
import {
  ChecklistTitle,
  ChecklistTitleWrapper,
  ChecklistWrapper,
  FormControlWrapper,
  FormWrapper,
  Progress
} from '../styles';
import { IChecklist, IChecklistItem } from '../types';

type Props = {
  item: IChecklist;
  addItem: (content: string) => void;
  convertToCard: (name: string, callback: () => void) => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  remove: (checklistId: string) => void;
  updateOrderItems: (item: IChecklistItem, destinationIndex: number) => void;
};

function List(props: Props) {
  const { item } = props;

  const [items, setItems] = React.useState(item.items);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState(
    item.items.length === 0 ? true : false
  );
  const [isHidden, setIsHidden] = useState( localStorage.getItem('isHidden') === 'true' ? true : false);
  const [itemContent, setItemContent] = useState(
    getUnsavedContent(props.item._id) || ''
  );
  const [title, setTitle] = useState(item.title);
  const [beforeTitle, setBeforeTitle] = useState(item.title);

  useEffect(() => {
    setItems(item.items);
  }, [item.items]);

  useEffect(() => {
    setTitle(item.title);
    setBeforeTitle(item.title);
  }, [item.title]);

  function onAddItemClick() {
    setIsAddingItem(true);
  }

  function onFocus(event) {
    event.target.select();
  }

  function onCancel(toggle?: boolean) {
    localStorage.setItem(item._id, itemContent);

    debounce(() => {
      setIsAddingItem(Boolean(toggle));
    }, 100)();
  }

  function onBlur() {
    if (isEmptyContent(itemContent)) {
      return;
    }

    onCancel(true);
  }

  function removeClick() {
    const { remove } = props;

    remove(item._id);
  }

  function getUnsavedContent(id: string) {
    return localStorage.getItem(id) || '';
  }

  function onContentChange(e) {
    setItemContent((e.currentTarget as HTMLTextAreaElement).value);
  }

  function onSubmitAddItem(e) {
    e.preventDefault();

    saveAddItem();
  }

  function onChangeItems(updatedItems, destinationIndex) {
    setItems(updatedItems);
    props.updateOrderItems(updatedItems[destinationIndex], destinationIndex);
  }

  function onKeyPressAddItem(e) {
    if (e.key === 'Enter') {
      e.preventDefault();

      saveAddItem();
      onBlur();
    }
  }

  function saveAddItem() {
    // check if a string contains whitespace or empty
    if (isEmptyContent(itemContent)) {
      return;
    }

    const content = itemContent.match(/^.*((\r\n|\n|\r)|$)/gm) || [];

    // for sorting alphanumerical strings
    const collator = new Intl.Collator(undefined, {
      numeric: true,
      sensitivity: 'base'
    });

    content.sort(collator.compare).map(text => props.addItem(text));

    setItemContent('');
    setIsAddingItem(false);

    localStorage.removeItem(item._id);
  }

  function renderIsCheckedBtn() {
    const onClickHideShowBtn = () => {
      setIsHidden(!isHidden);
      localStorage.setItem('isHidden', `${!isHidden}`);
    }
    const checkedItems = item.items.filter(data => data.isChecked);
    const btnText = isHidden
      ? `Show checked items (${isHidden && checkedItems.length})`
      : 'Hide completed items';

    if (item.percent) {
      return (
        <Button btnStyle="simple" size="small" onClick={onClickHideShowBtn}>
          {__(btnText)}
        </Button>
      );
    }

    return null;
  }

  function renderTitle() {
    const onClick = () => setIsEditingTitle(true);

    if (isEditingTitle) {
      return null;
    }

    return (
      <>
        <h5 onClick={onClick}>{title}</h5>
        <div>
          {renderIsCheckedBtn()}
          <Button btnStyle="simple" size="small" onClick={removeClick}>
            Delete
          </Button>
        </div>
      </>
    );
  }

  function generateDoc(values: { title: string }) {
    return {
      _id: item._id,
      title: values.title || title
    };
  }

  function renderTitleInput(formProps: IFormProps) {
    const { isSubmitted, values } = formProps;

    if (!isEditingTitle) {
      return null;
    }

    const cancelEditing = () => {
      setIsEditingTitle(false);
      setTitle(beforeTitle);
    };

    const onChangeTitle = e =>
      setTitle((e.currentTarget as HTMLTextAreaElement).value);

    const onSubmit = () => {
      setIsEditingTitle(false);
      setBeforeTitle(title);
    };

    return (
      <FormControlWrapper>
        <FormControl
          {...formProps}
          name="title"
          autoFocus={true}
          componentClass="textarea"
          onChange={onChangeTitle}
          value={title}
          required={true}
        />

        {props.renderButton({
          values: generateDoc(values),
          isSubmitted,
          callback: onSubmit
        })}

        <Button
          btnStyle="simple"
          onClick={cancelEditing}
          size="small"
          icon="times"
        />
      </FormControlWrapper>
    );
  }

  function renderProgressBar() {
    return (
      <Progress>
        <span>{item.percent.toFixed(0)}%</span>
        <ProgressBar
          percentage={item.percent}
          color={colors.colorPrimary}
          height="10px"
        />
      </Progress>
    );
  }

  function renderItems() {
    const child = childItem => {
      if (isHidden && childItem.isChecked) {
        return null;
      }

      return (
        <Item
          key={childItem._id}
          item={childItem}
          convertToCard={props.convertToCard}
        />
      );
    };

    return (
      <SortableList
        fields={items}
        child={child}
        isModal={false}
        onChangeFields={onChangeItems}
        isDragDisabled={false}
        showDragHandler={false}
      />
    );
  }

  function renderAddInput() {
    if (isAddingItem) {
      const onClick = () => onCancel(false);

      return (
        <FormWrapper add={true}>
          <FormControlWrapper onBlur={onBlur}>
            <FormControl
              componentClass="textarea"
              placeholder="Add an item"
              onChange={onContentChange}
              onKeyPress={onKeyPressAddItem}
              autoFocus={true}
              onFocus={onFocus}
              required={true}
            />
            <Button
              btnStyle="success"
              size="small"
              icon="check-1"
              onMouseDown={onSubmitAddItem}
            />
            <Button
              btnStyle="simple"
              size="small"
              onClick={onClick}
              icon="times"
            />
          </FormControlWrapper>
        </FormWrapper>
      );
    }

    return (
      <Button size="small" btnStyle="simple" onClick={onAddItemClick}>
        {__('Add an item')}
      </Button>
    );
  }

  return (
    <>
      <ChecklistTitleWrapper>
        <Icon icon="checked" />

        <ChecklistTitle>
          {renderTitle()}
          <Form renderContent={renderTitleInput} />
        </ChecklistTitle>
      </ChecklistTitleWrapper>

      {renderProgressBar()}

      <ChecklistWrapper>
        {renderItems()}
        {renderAddInput()}
      </ChecklistWrapper>
    </>
  );
}

export default List;
