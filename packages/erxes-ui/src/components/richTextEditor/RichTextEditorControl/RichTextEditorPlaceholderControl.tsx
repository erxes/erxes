import React from "react";
import DropdownButton from "react-bootstrap/DropdownButton";
import { useRichTextEditorContext } from "../RichTextEditor.context";
import { PlaceholderWrapper } from "./styles";
import { Menu } from "@headlessui/react";

export const RichTextEditorPlaceholderControl = ({
  placeholderProp,
  toolbarPlacement,
}) => {
  const { editor, isSourceEnabled } = useRichTextEditorContext();

  const handlePlaceholder = (placeholderValue: string) => {
    editor?.chain().focus().insertContent(`{{ ${placeholderValue} }}`).run();
  };

  return (
    <PlaceholderWrapper $toolbarPlacement={toolbarPlacement}>
      <DropdownButton
        id="dropdown-item-button"
        title={placeholderProp?.title}
        disabled={isSourceEnabled}
      >
        {placeholderProp?.items?.map((item: any) => {
          if (!item?.value) {
            return (
              <div key={item?.name}>{item?.name}</div>
            );
          }
          return (
            <Menu.Item
              as="button"
              key={item?.value}
              onClick={() => handlePlaceholder(item?.value)}
            >
              {item?.name}
            </Menu.Item>
          );
        })}
      </DropdownButton>
    </PlaceholderWrapper>
  );
};
