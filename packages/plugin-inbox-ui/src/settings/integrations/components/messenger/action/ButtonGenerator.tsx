import { ButtonRow, Container, Row } from "../widgetPreview/styles";
import React, { useEffect, useState } from "react";

import ActionButtons from "@erxes/ui/src/components/ActionButtons";
import Alert from "@erxes/ui/src/utils/Alert/index";
import Button from "@erxes/ui/src/components/Button";
import Dropdown from "@erxes/ui/src/components/Dropdown";
import DropdownToggle from "@erxes/ui/src/components/DropdownToggle";
import { FormContainer } from "@erxes/ui-sales/src/boards/styles/common";
import FormControl from "@erxes/ui/src/components/form/Control";
import Icon from "@erxes/ui/src/components/Icon";
import LinkAction from "./LinkAction";
import { Menu } from "@headlessui/react";
import { __ } from "@erxes/ui/src/utils/core";

type Props = {
  _id: string;
  buttons: any[];
  onChange: (_id: string, name: string, value: any) => void;
  hideMenu?: boolean;
  addButtonLabel?: string;
  limit?: number;
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
  limit
}: Props) {
  const [btns, setButtons] = useState(buttons as Buttons[]);
  const [error, setError] = useState(false);
  useEffect(() => {
    setButtons(buttons);
  }, [buttons]);

  const generateButtons = () => {
    return btns.map(({ _id, text, link, type }) => ({ _id, text, link, type }));
  };

  const onChangeButtons = (buttons) => {
    onChange(_id, "buttons", buttons);
  };

  const renderButton = (button) => {
    const onBtnChange = (name, value) => {
      const updateButtons = btns.map((btn) =>
        btn._id === button._id ? { ...btn, [name]: value } : btn
      );
      setButtons(updateButtons);
      onChangeButtons(
        updateButtons.map(({ _id, text, type, link }) => ({
          _id,
          text,
          type,
          link
        }))
      );
    };

    const onDoubleClick = () => {
      setButtons(
        btns.map((btn) =>
          btn._id === button._id ? { ...btn, isEditing: true } : btn
        )
      );
    };

    const onEdit = (e) => {
      const { value } = e.currentTarget as HTMLInputElement;

      if (value.length > 20) {
        if (value.length > 21) {
          Alert.warning("You cannot set text more than 20 characters");
          setError(true);
        }
        return;
      }

      if (error) {
        setError(false);
      }

      const updateButtons = btns.map((btn) =>
        btn._id === button._id ? { ...btn, text: value } : btn
      );
      setButtons(updateButtons);
    };

    const onSave = (e) => {
      const { value } = e.currentTarget as HTMLInputElement;

      e.preventDefault();
      if (value.trim().length === 0) {
        return Alert.warning("Button text required!");
      }

      onBtnChange("isEditing", false);
    };

    const onRemove = () => {
      const updateButtons = generateButtons().filter(
        (btn) => btn._id !== button._id
      );

      onChangeButtons(updateButtons);
    };

    const onBtnTypeChange = (e, type) => {
      e.preventDefault();

      onBtnChange("type", type);
    };

    const renderTrigger = (type) => {
      if (type === "link") {
        const onChangeLink = (e) => {
          e.stopPropagation();
          const { value } = e.currentTarget as HTMLInputElement;

          onBtnChange("link", value);
        };

        return (
          <Row>
            <div onClick={(e) => e.stopPropagation()}>
              <LinkAction
                container={this}
                onChange={onChangeLink}
                link={button.link}
              />
            </div>
            <Button
              btnStyle='link'
              size='small'>
              {__("Link")} <Icon icon='angle-down' />
            </Button>
          </Row>
        );
      }

      return (
        <Button
          btnStyle='link'
          size='small'
          style={{ display: "flex", gap: 5 }}>
          {__("Button")} <Icon icon='angle-down' />
        </Button>
      );
    };

    const renderInput = () => {
      if (button?.isEditing) {
        return (
          <FormContainer>
            <FormControl
              className='editInput'
              placeholder={__("Enter a name")}
              onChange={onEdit}
              value={button?.text || null}
              onBlur={onSave}
              onKeyPress={(e) => e.key === "Enter" && onSave(e)}
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
        twoElement={hideMenu}>
        {renderInput()}

        {!hideMenu && (
          <Dropdown
            as={DropdownToggle}
            toggleComponent={renderTrigger(button.type)}>
            <Container>
              {[
                { type: "btn", text: "Button" },
                { type: "link", text: "Link" }
              ].map(({ text, type }) => (
                <Menu.Item key={type}>
                  <a onClick={(e) => onBtnTypeChange(e, type)}>{text}</a>
                </Menu.Item>
              ))}
            </Container>
          </Dropdown>
        )}

        <ActionButtons>
          <Icon
            icon='times'
            onClick={onRemove}
          />
        </ActionButtons>
      </ButtonRow>
    );
  };

  const addButton = () => {
    const newBtnCount = btns.filter((btn) =>
      btn.text.includes("New Button #")
    ).length;

    onChangeButtons([
      ...generateButtons(),
      {
        _id: Math.random().toString(),
        text: `New Button #${newBtnCount + 1}`,
        type: "button",
        isEditing: true
      }
    ]);
  };

  const renderAddButton = () => {
    if (limit && btns.length + 1 > limit) {
      return null;
    }

    return (
      <Button
        block
        disabled={error}
        btnStyle='link'
        icon='plus-1'
        onClick={addButton}>
        {__(addButtonLabel || "Add Button")}
      </Button>
    );
  };

  return (
    <>
      {btns.map((button) => renderButton(button))}
      {renderAddButton()}
    </>
  );
}

export default ButtonsGenerator;
