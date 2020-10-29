import debounce from 'lodash/debounce';
import Button from 'modules/common/components/Button';
import DropdownToggle from 'modules/common/components/DropdownToggle';
import { FormControl } from 'modules/common/components/form';
import Icon from 'modules/common/components/Icon';
import { isEmptyContent } from 'modules/common/utils';
import React, { useEffect, useState } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import xss from 'xss';
import {
  ChecklistItem,
  ChecklistText,
  FormControlWrapper,
  FormWrapper
} from '../styles';
import { IChecklistItem } from '../types';

type Props = {
  item: IChecklistItem;
  editItem: (
    doc: { content: string; isChecked: boolean },
    callback?: () => void
  ) => void;
  convertToCard: (name: string, callback: () => void) => void;
  removeItem: (checklistItemId: string) => void;
};

function Item(props: Props) {
  const item = props.item;

  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(item.content);
  const [disabled, setDisabled] = useState(false);
  const [isChecked, setIsChecked] = useState(item.isChecked || false);
  const [beforeContent, setBeforeContent] = useState(item.content);

  useEffect(() => {
    setIsChecked(item.isChecked || false);
    setBeforeContent(item.content);
    setContent(item.content);
  }, [item]);

  function onFocus(event) {
    event.target.select();
  }

  function onClick() {
    setIsEditing(true);
    setBeforeContent(content);
  }

  function onKeyPress(e) {
    if (e.key === 'Enter') {
      e.preventDefault();

      handleSave();
    }
  }

  function onSubmit(e) {
    e.preventDefault();

    handleSave();
  }

  function onBlur() {
    if (isEmptyContent(content)) {
      return;
    }

    debounce(() => setIsEditing(false), 100)();
  }

  function onCheckChange(e) {
    const { editItem } = props;

    const checked = (e.currentTarget as HTMLInputElement).checked;

    setIsChecked(checked);
    setIsEditing(false);

    editItem({ content, isChecked: checked });
  }

  function handleSave() {
    if (isEmptyContent(content)) {
      return;
    }

    setDisabled(true);

    props.editItem({ content, isChecked }, () => {
      setDisabled(false);
      setIsEditing(false);
    });
  }

  function onRemove() {
    const { removeItem } = props;

    removeItem(item._id);
  }

  function onConvert() {
    props.convertToCard(content, onRemove);
  }

  function renderContent() {
    const onChangeContent = e => {
      setContent((e.currentTarget as HTMLTextAreaElement).value);
    };

    const onCancel = () => {
      setIsEditing(false);
      setContent(beforeContent);
    };

    if (isEditing) {
      return (
        <FormWrapper onSubmit={onSubmit} onBlur={onBlur}>
          <FormControlWrapper>
            <FormControl
              componentClass="textarea"
              autoFocus={true}
              onFocus={onFocus}
              onChange={onChangeContent}
              value={content}
              onKeyPress={onKeyPress}
              required={true}
            />
            <Button
              disabled={disabled}
              btnStyle="success"
              type="submit"
              size="small"
              icon="check-1"
            />
            <Button
              btnStyle="simple"
              size="small"
              onClick={onCancel}
              icon="times"
            />
          </FormControlWrapper>
        </FormWrapper>
      );
    }

    return (
      <ChecklistText isChecked={isChecked}>
        <label
          onClick={onClick}
          dangerouslySetInnerHTML={{ __html: xss(content) }}
        />

        <Dropdown>
          <Dropdown.Toggle as={DropdownToggle} id="dropdown-brand">
            <Icon icon="ellipsis-h" />
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <li>
              <a onClick={onConvert} href="#convert">
                Convert to Card
              </a>
            </li>
            <li>
              <a onClick={onRemove} href="#remove">
                Delete
              </a>
            </li>
          </Dropdown.Menu>
        </Dropdown>
      </ChecklistText>
    );
  }

  return (
    <ChecklistItem>
      <FormControl
        componentClass="checkbox"
        checked={isChecked}
        onChange={onCheckChange}
      />
      {renderContent()}
    </ChecklistItem>
  );
}

export default Item;
