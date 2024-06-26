import {
  IRichTextEditorControlBaseProps,
  RichTextEditorControlBase,
} from './RichTextEditorControl';
import React, { ReactNode, useState } from 'react';
import { RichTextEditorMenuWrapper } from './styles';

import Icon from '../../Icon';
import { Popover } from '@headlessui/react';
import { useRichTextEditorContext } from '../RichTextEditor.context';
import { usePopper } from 'react-popper';

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

  let [referenceElement, setReferenceElement] =
    useState<HTMLButtonElement | null>(null);

  let [popperElement, setPopperElement] = useState<HTMLDivElement | null>();

  let { styles, attributes } = usePopper(referenceElement, popperElement, {
    modifiers: [
      {
        name: 'flip',
        options: {
          fallbackPlacements: ['bottom-end', 'top-end'],
          allowedAutoPlacements: ['bottom-end', 'top-end'],
        },
      },
    ],
  });

  const renderMenu = () => (
    <RichTextEditorMenuWrapper>{props.children}</RichTextEditorMenuWrapper>
  );

  return (
    <Popover>
      <Popover.Button
        ref={setReferenceElement}
        as={RichTextEditorControlBase}
        icon={MoreIcon}
        aria-label={labels.moreControlLabel}
        title={labels.moreControlLabel}
      />
      <Popover.Panel
        ref={setPopperElement}
        style={{
          ...styles.popper,
          zIndex: 100,
        }}
        {...attributes.popper}
      >
        {renderMenu}
      </Popover.Panel>
    </Popover>
  );
};
