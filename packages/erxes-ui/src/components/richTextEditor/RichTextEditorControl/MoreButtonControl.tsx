import React, { ReactNode } from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import { useRichTextEditorContext } from '../RichTextEditor.context';
import {
  IRichTextEditorControlBaseProps,
  RichTextEditorControlBase,
} from './RichTextEditorControl';
import Icon from '../../Icon';
import {
  RichTextEditorMenuWrapper,
  RichTextEditorMenuPopoverWrapper,
} from './styles';

export interface IRichTextEditorMoreControlProps
  extends React.HTMLAttributes<HTMLDivElement> {
  toolbarPlacement?: 'top' | 'bottom';
  children: ReactNode;
}

const MoreIcon: IRichTextEditorControlBaseProps['icon'] = () => (
  <Icon icon="ellipsis-v" />
);

export const MoreButtonControl = (props: IRichTextEditorMoreControlProps) => {
  const { labels } = useRichTextEditorContext();
  const { toolbarPlacement, children } = props;

  const renderMenu = (props) => (
    <RichTextEditorMenuPopoverWrapper>
      <Popover id="rte-more-menu" {...props}>
        <RichTextEditorMenuWrapper>{children}</RichTextEditorMenuWrapper>
      </Popover>
    </RichTextEditorMenuPopoverWrapper>
  );

  return (
    <OverlayTrigger
      rootClose={true}
      trigger="click"
      placement={toolbarPlacement === 'top' ? 'bottom-end' : 'top'}
      overlay={renderMenu}
    >
      <RichTextEditorControlBase
        icon={MoreIcon}
        aria-label={labels.moreControlLabel}
        title={labels.moreControlLabel}
      />
    </OverlayTrigger>
  );
};
