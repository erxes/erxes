import React, { useState } from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import { BoxArrowUpRight } from 'react-bootstrap-icons';
import { useRichTextEditorContext } from '../RichTextEditor.context';
import {
  RichTextEditorControlBaseProps,
  RichTextEditorControlBase
} from './RichTextEditorControl';
import Tip from '../../Tip';
import { InputAction, InputWrapper, LinkInput, LinkWrapper } from './styles';
import Icon from '../../Icon';

const LinkIcon: RichTextEditorControlBaseProps['icon'] = () => (
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
      ? ctx.editor
          ?.chain()
          .focus()
          .extendMarkRange('link')
          .unsetLink()
          .run()
      : ctx.editor
          ?.chain()
          .focus()
          .extendMarkRange('link')
          .setLink({ href: url, target: external ? '_blank' : null })
          .run();
  };

  const handleInputKeydown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      setLink();
    }
  };

  return (
    <OverlayTrigger
      trigger="click"
      rootClose={true}
      placement="top"
      overlay={
        <LinkWrapper>
          <InputWrapper>
            <LinkInput
              placeholder={ctx.labels.linkEditorInputPlaceholder}
              aria-label={ctx.labels.linkEditorInputLabel}
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
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
                  onClick={() => setExternal(e => !e)}
                  data-active={external || undefined}
                >
                  <BoxArrowUpRight
                    style={{ width: '0.875rem', height: '0.875rem' }}
                  />
                </button>
              </Tip>
            </InputAction>
          </InputWrapper>
          <button onClick={setLink}>{ctx.labels.linkEditorSave}</button>
        </LinkWrapper>
      }
    >
      <RichTextEditorControlBase
        icon={icon || LinkIcon}
        aria-label={ctx.labels.linkControlLabel}
        title={ctx.labels.linkControlLabel}
        onClick={handleOpen}
        active={ctx.editor?.isActive('link')}
      />
    </OverlayTrigger>
  );
};
