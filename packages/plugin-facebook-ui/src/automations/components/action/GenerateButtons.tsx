import colors from '@erxes/ui/src/styles/colors';
import SortableList from '@erxes/ui/src/components/SortableList';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import Alert from '@erxes/ui/src/utils/Alert/index';
import Icon from '@erxes/ui/src/components/Icon';
import { __ } from '@erxes/ui/src/utils/core';
import { LinkButton } from '@erxes/ui/src/styles/main';
const List = styled.ul`
  list-style: none;
  padding: 0;

  button {
    margin-top: 10px;
  }

  li {
    position: relative;
    margin-bottom: 5px;
    background-color: ${colors.colorWhite};
    border: 1px solid ${colors.borderPrimary};
    padding: 5px 10px;
    display: flex;
    justify-content: space-between;
    width: 100%;
    border: none;

    &:hover {
      cursor: pointer;
    }
  }

  input.editInput {
    border: none;
    outline: none;
  }

  input.editInput:focus {
    outline: none;
  }
`;

type Props = {
  buttons: any[];
  onChange: (options: any[]) => void;
  emptyMessage?: string;
  extraActions?(button: any): any;
};

function GenerateButtons({
  buttons = [],
  onChange,
  emptyMessage,
  extraActions,
}: Props) {
  const [_buttons, setButtons] = useState(
    buttons as { text: string; _id: string; isEditing?: boolean }[],
  );

  useEffect(() => {
    setButtons(buttons);
  }, [buttons]);

  const generateButtons = () => {
    return _buttons.map(({ _id, text }) => ({ _id, text }));
  };

  const onChangeButtons = (buttons) => {
    onChange(buttons);
  };

  const renderButton = (button: any) => {
    const onChange = (name, value) => {
      const updateButtons = _buttons.map((btn) =>
        btn._id === button._id ? { ...btn, [name]: value } : btn,
      );

      setButtons(updateButtons);
    };

    const onDoubleClick = () => {
      onChange('isEditing', true);
    };

    const handleEdit = (e) => {
      const { value } = e.currentTarget as HTMLInputElement;

      onChange('text', value);
    };

    const onSave = (e) => {
      const { value } = e.currentTarget as HTMLInputElement;

      e.preventDefault();
      if (value.trim().length === 0) {
        return Alert.warning('Button text required!');
      }

      onChange('isEditing', false);
      onChangeButtons(generateButtons());
    };

    const onRemove = () => {
      const updateButtons = generateButtons().filter(
        (btn) => btn._id !== button._id,
      );

      onChangeButtons(updateButtons);
    };

    return (
      <li key={button._id} onDoubleClick={onDoubleClick}>
        {button?.isEditing ? (
          <input
            className="editInput"
            onChange={handleEdit}
            value={button.text}
            onBlur={onSave}
            onKeyPress={(e) => e.key === 'Enter' && onSave(e)}
          />
        ) : (
          button.text
        )}
        <ActionButtons>
          {extraActions && extraActions(button)}
          <Icon icon="cancel-1" onClick={onRemove} />
        </ActionButtons>
      </li>
    );
  };

  const renderListOption = (
    <SortableList
      fields={_buttons}
      child={renderButton}
      onChangeFields={onChangeButtons}
      isModal={true}
      showDragHandler={false}
      droppableId="property option fields"
      emptyMessage={emptyMessage}
    />
  );

  const handleAddButton = () => {
    onChangeButtons([
      ...generateButtons(),
      { _id: Math.random().toString(), text: '', isEditing: true },
    ]);
  };

  return (
    <List>
      {renderListOption}
      <LinkButton onClick={handleAddButton}>{__('+ Add Button')}</LinkButton>
    </List>
  );
}

export default GenerateButtons;
