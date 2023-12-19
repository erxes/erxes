import React from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import { useRichTextEditorContext } from '../RichTextEditor.context';
import { PlaceholderWrapper } from './styles';

type SelectProps = {
  value: string;
  label: string | number;
};

export const RichTextEditorPlaceholderControl = ({ placeholderProp }) => {
  const { editor, isSourceEnabled } = useRichTextEditorContext();

  const handlePlaceholder = (placeholderValue: string) => {
    editor
      ?.chain()
      .focus()
      .insertContent(`{{${placeholderValue}}}`)
      .run();
  };

  return (
    <PlaceholderWrapper>
      <DropdownButton
        id="dropdown-item-button"
        title={placeholderProp?.title}
        disabled={isSourceEnabled}
      >
        {placeholderProp?.items?.map((item: any) => {
          if (!item?.value) {
            return (
              <Dropdown.Header key={item?.name}>{item?.name}</Dropdown.Header>
            );
          }
          return (
            <Dropdown.Item
              as="button"
              key={item?.value}
              onClick={() => handlePlaceholder(item?.value)}
            >
              {item?.name}
            </Dropdown.Item>
          );
        })}
      </DropdownButton>
    </PlaceholderWrapper>
  );
};
