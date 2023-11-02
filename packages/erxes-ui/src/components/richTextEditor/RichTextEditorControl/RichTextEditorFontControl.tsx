import React, { useRef, useState } from 'react';
import { Link, BoxArrowUpRight } from 'react-bootstrap-icons';
import { useRichTextEditorContext } from '../RichTextEditor.context';
import Select from 'react-select-plus';
import {
  RichTextEditorControlBaseProps,
  RichTextEditorControlBase
} from './RichTextEditorControl';
import Tip from '../../Tip';
import {
  FontSelectWrapper,
  InputAction,
  InputWrapper,
  LinkInput,
  LinkWrapper
} from './styles';
import { SelectWrapper } from '../../form/styles';

const LinkIcon: RichTextEditorControlBaseProps['icon'] = props => (
  <Link {...props} />
);

export const RichTextEditorFontControl = props => {
  const {
    classNames,
    className,
    style,
    styles,
    vars,
    icon,
    popoverProps,
    disableTooltips,
    initialExternal,
    ...others
  } = props;
  const [fontSize, setFontSize] = useState('');
  const ctx = useRichTextEditorContext();
  const fontSizes = [
    'default',
    8,
    9,
    10,
    11,
    12,
    14,
    16,
    18,
    20,
    22,
    24,
    26,
    28,
    36,
    42,
    72
  ];

  const setSize = (size: string) => {
    setFontSize(size === 'default' ? '13px' : size + 'px');
    ctx.editor
      ?.chain()
      .setFontSize(size === 'default' ? '13px' : size + 'px')
      .focus()
      .run();
  };

  const handleInputKeydown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      //   setLink();
    }
  };

  return (
    <FontSelectWrapper>
      <Select
        //  placeholder={ctx.labels.linkEditorInputPlaceholder}
        //           aria-label={ctx.labels.linkEditorInputLabel}
        placeholder="Size"
        multi={false}
        value={fontSize}
        onChange={val => setSize(val.value)}
        options={fontSizes.map(size => ({
          value: size,
          label: size
          //   <p style={{ fontSize: size }}>
        }))}
      />
    </FontSelectWrapper>
  );
};
