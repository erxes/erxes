import {
  ActionButtons,
  Alert,
  Button,
  FormControl,
  Icon,
  __,
} from '@erxes/ui/src';
import React, { useEffect, useState } from 'react';
import { ButtonRow, Container } from '../../styles';
import Dropdown from 'react-bootstrap/Dropdown';
import { FormContainer } from '@erxes/ui-cards/src/boards/styles/common';
import DropdownToggle from '@erxes/ui/src/components/DropdownToggle';
import LinkAction from './LinkAction';

type Props = {
  _id: string;
  buttons: any[];
  onChange: (_id: string, name: string, value: any) => void;
  hideMenu?: boolean;
  addButtonLabel?: string;
};

type Buttons = {
  text: string;
  _id: string;
  isEditing?: boolean;
  type: string;
  link?: string;
};

function ButtonsGenerator({
  _id,
  buttons = [],
  onChange,
  hideMenu,
  addButtonLabel,
}: Props) {
  const [btns, setButtons] = useState(buttons as Buttons[]);

  useEffect(() => {
    setButtons(buttons);
  }, [buttons]);

  const generateButtons = () => {
    console.log({ btns });
    return btns.map(({ _id, text, link, type }) => ({ _id, text, link, type }));
  };

  const onChangeButtons = (buttons) => {
    onChange(_id, 'buttons', buttons);
  };

  const renderButton = (button) => {
    const onBtnChange = (name, value) => {
      console.log({ name, value });
      const updateButtons = btns.map((btn) =>
        btn._id === button._id ? { ...btn, [name]: value } : btn,
      );

      setButtons(updateButtons);
      onChangeButtons(
        updateButtons.map(({ _id, text, link, type }) => ({
          _id,
          text,
          link,
          type,
        })),
      );
    };

    const onDoubleClick = () => {
      onBtnChange('isEditing', true);
    };

    const handleEdit = (e) => {
      const { value } = e.currentTarget as HTMLInputElement;

      onBtnChange('text', value);
    };

    const onSave = (e) => {
      const { value } = e.currentTarget as HTMLInputElement;

      e.preventDefault();
      if (value.trim().length === 0) {
        return Alert.warning('Button text required!');
      }

      onBtnChange('isEditing', false);
    };

    const onRemove = () => {
      const updateButtons = generateButtons().filter(
        (btn) => btn._id !== button._id,
      );

      onChangeButtons(updateButtons);
    };

    const handleBtnTypeChange = (e, type) => {
      e.preventDefault();

      onBtnChange('type', type);
    };

    const renderTrigger = (type) => {
      if (type === 'link') {
        const onChangeLink = (e) => {
          e.stopPropagation();
          const { value } = e.currentTarget as HTMLInputElement;

          onBtnChange('link', value);
        };

        return (
          <>
            <LinkAction
              container={this}
              onChange={onChangeLink}
              link={button.link}
            />
            <Button btnStyle="link" size="small">
              {__('Link')} <Icon icon="angle-down" />
            </Button>
          </>
        );
      }

      return (
        <Button
          btnStyle="link"
          size="small"
          style={{ display: 'flex', gap: 5 }}
        >
          {__('Button')} <Icon icon="angle-down" />
        </Button>
      );
    };

    const renderInput = () => {
      if (button?.isEditing) {
        return (
          <FormContainer>
            <FormControl
              className="editInput"
              placeholder="Enter a name"
              onChange={handleEdit}
              value={button.text}
              onBlur={onSave}
              onKeyPress={(e) => e.key === 'Enter' && onSave(e)}
            />
          </FormContainer>
        );
      }
      return <a>{button.text}</a>;
    };

    return (
      <ButtonRow
        key={button._id}
        onDoubleClick={onDoubleClick}
        twoElement={hideMenu}
      >
        {renderInput()}

        {!hideMenu && (
          <Dropdown>
            <Dropdown.Toggle
              id="dropdown-customize dropdown-autoclose-true"
              as={DropdownToggle}
            >
              {renderTrigger(button.type)}
            </Dropdown.Toggle>
            <Dropdown.Menu rootCloseEvent="click">
              <Container>
                {[
                  { type: 'btn', text: 'Button' },
                  { type: 'link', text: 'Link' },
                ].map(({ text, type }) => (
                  <li onClick={(e) => handleBtnTypeChange(e, type)}>
                    <a>{text}</a>
                  </li>
                ))}
              </Container>
            </Dropdown.Menu>
          </Dropdown>
        )}

        <ActionButtons>
          <Icon icon="times" onClick={onRemove} />
        </ActionButtons>
      </ButtonRow>
    );
  };

  const addButton = () => {
    const newBtnCount = btns.filter((btn) =>
      btn.text.includes('New Button #'),
    ).length;

    onChangeButtons([
      ...generateButtons(),
      {
        _id: Math.random().toString(),
        text: `New Button #${newBtnCount + 1}`,
        type: 'button',
        isEditing: true,
      },
    ]);
  };

  return (
    <>
      {btns.map((button) => renderButton(button))}
      <Button block btnStyle="link" icon="plus-1" onClick={addButton}>
        {__(addButtonLabel || 'Add Button')}
      </Button>
    </>
  );
}

export default ButtonsGenerator;
