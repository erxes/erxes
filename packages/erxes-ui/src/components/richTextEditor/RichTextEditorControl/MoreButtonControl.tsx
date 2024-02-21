import {
  IRichTextEditorControlBaseProps,
  RichTextEditorControlBase,
} from './RichTextEditorControl';
import React, { ReactNode } from 'react';
import {
  RichTextEditorMenuPopoverWrapper,
  RichTextEditorMenuWrapper,
} from './styles';

import Icon from '../../Icon';
import { Popover } from '@headlessui/react';
import { useRichTextEditorContext } from '../RichTextEditor.context';

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
      {/* <Popover id="rte-more-menu" {...props}> */}
      <RichTextEditorMenuWrapper>{children}</RichTextEditorMenuWrapper>
      {/* </Popover> */}
    </RichTextEditorMenuPopoverWrapper>
  );

  return (
    <Popover>
      <Popover.Button>
        <RichTextEditorControlBase
          icon={MoreIcon}
          aria-label={labels.moreControlLabel}
          title={labels.moreControlLabel}
        />
      </Popover.Button>
      <Popover.Panel>{renderMenu}</Popover.Panel>
    </Popover>
  );
};
