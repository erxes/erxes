import { Menu } from "@headlessui/react";
import { PlaceholderWrapper } from "./styles";
import React from "react";
import { useRichTextEditorContext } from "../RichTextEditor.context";

export const RichTextEditorPlaceholderControl = ({
  placeholderProp,
  toolbarPlacement,
}) => {
  const { editor, isSourceEnabled } = useRichTextEditorContext();

  const handlePlaceholder = (placeholderValue: string) => {
    editor?.chain().focus().insertContent(`{{ ${placeholderValue} }}`).run();
  };

  return (
    <Menu as={PlaceholderWrapper} $toolbarPlacement={toolbarPlacement}>
      <Menu.Button
        id="dropdown-item-button"
        title={placeholderProp?.title}
        disabled={isSourceEnabled}
      >
        {placeholderProp?.items?.map((item: any) => {
          if (!item?.value) {
            return <div key={item?.name}>{item?.name}</div>;
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
      </Menu.Button>
    </Menu>
  );
};
