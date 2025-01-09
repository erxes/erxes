import {
  IRichTextEditorControlBaseProps,
  RichTextEditorControlBase,
} from './RichTextEditorControl';

import {
  InputAction,
  InputWrapper,
  LinkButton,
  LinkInput,
  LinkWrapper,
} from './styles';
import React, { useState } from 'react';
import { usePopper } from 'react-popper';
import { Popover } from '@headlessui/react';

import { BoxArrowUpRight } from 'react-bootstrap-icons';
import Icon from '../../Icon';
import Tip from '../../Tip';
import { useRichTextEditorContext } from '../RichTextEditor.context';

const LinkIcon: IRichTextEditorControlBaseProps['icon'] = () => (
  <Icon icon="link-alt" />
);

export type RichTextEditorLinkControlProps = {
  icon?: React.FC;
  initialExternal?: boolean;
};

export const RichTextEditorLinkControl = (
  props: RichTextEditorLinkControlProps
) => {
  const { icon, initialExternal } = props;

  const ctx = useRichTextEditorContext();

  const [url, setUrl] = useState('');
  const [external, setExternal] = useState(initialExternal);
  const [opened, setOpened] = useState(false);

  let [referenceElement, setReferenceElement] = useState();
  let [popperElement, setPopperElement] = useState();
  let { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: 'auto',
    modifiers: [
      {
        name: 'flip',
        options: {
          allowedAutoPlacements: ['top', 'bottom'],
        },
      },
    ],
  });

  const open = () => {
    setOpened(true);
  };
  const close = () => {
    setOpened(false);
  };

  const handleOpen = () => {
    open();
    const linkData = ctx.editor?.getAttributes('link');
    setUrl(linkData?.href || '');
    setExternal(linkData?.target === '_blank');
  };

  const handleClose = () => {
    close();
    setUrl('');
    setExternal(initialExternal);
  };

  const setLink = () => {
    handleClose();
    url === ''
      ? ctx.editor?.chain().focus().extendMarkRange('link').unsetLink().run()
      : ctx.editor
          ?.chain()
          .focus()
          .extendMarkRange('link')
          .setLink({ href: url, target: external ? '_blank' : null })
          .run();
  };

  const handleSave = () => {
    setLink();
  };

  const handleInputKeydown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      setLink();
    }
  };

  return (
    <Popover className="relative">
      <Popover.Button
        ref={setReferenceElement}
        as={RichTextEditorControlBase}
        icon={icon || LinkIcon}
        aria-label={ctx.labels.linkControlLabel}
        title={ctx.labels.linkControlLabel}
        onClick={handleOpen}
        active={ctx.editor?.isActive('link')}
      />
      <Popover.Panel
        className="absolute z-10"
        ref={setPopperElement}
        style={styles.popper}
        {...attributes.popper}
      >
        <LinkWrapper>
          <InputWrapper>
            <LinkInput
              placeholder={ctx.labels.linkEditorInputPlaceholder}
              aria-label={ctx.labels.linkEditorInputLabel}
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={handleInputKeydown}
            />
            <InputAction>
              <Tip
                placement="top"
                text={
                  external
                    ? ctx.labels.linkEditorExternalLink
                    : ctx.labels.linkEditorInternalLink
                }
              >
                <button
                  type="button"
                  onClick={() => setExternal((e) => !e)}
                  data-active={external || undefined}
                >
                  <BoxArrowUpRight
                    style={{ width: '0.875rem', height: '0.875rem' }}
                  />
                </button>
              </Tip>
            </InputAction>
          </InputWrapper>
          <LinkButton type="button" onClick={handleSave}>
            {ctx.labels.linkEditorSave}
          </LinkButton>
        </LinkWrapper>
      </Popover.Panel>
    </Popover>
  );
};
