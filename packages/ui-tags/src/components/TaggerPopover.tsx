import { Popover } from '@headlessui/react';
import React from 'react';
import Tagger from '../containers/Tagger';
import { __ } from '@erxes/ui/src/utils';
import { PopoverButton, PopoverHeader } from '@erxes/ui/src/styles/main';

type Props = {
  type: string;
  trigger: React.ReactNode;
  successCallback?: () => void;
  targets?: any[];
  container?: Element | Node | React.Component<any, {}, any>;
  refetchQueries?: any[];
  parentTagId?: string;
  singleSelect?: boolean;
  disableTreeView?: boolean;
  perPage?: number;
};

function TaggerPopover(props: Props) {
  const {
    trigger,
    container,
    refetchQueries,
    parentTagId,
    perPage,
    disableTreeView,
    ...taggerProps
  } = props;

  return (
    <Popover style={{ position: 'relative' }}>
      <Popover.Button>
        <PopoverButton>{trigger}</PopoverButton>
      </Popover.Button>

      <Popover.Panel style={{ position: 'absolute', zIndex: 10 }}>
        <PopoverHeader>{__('Choose your tags')}</PopoverHeader>
        <Tagger
          parentTagId={parentTagId}
          event="onExit"
          perPage={perPage}
          disableTreeView={disableTreeView}
          {...taggerProps}
          refetchQueries={refetchQueries}
        />
      </Popover.Panel>
    </Popover>
  );
}

export default TaggerPopover;
