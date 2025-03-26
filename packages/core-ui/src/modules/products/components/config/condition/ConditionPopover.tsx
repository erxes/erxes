import { Popover } from '@headlessui/react';
import React from 'react';
import ConditionSelecter from '../../../containers/config/ConditionSelecter';
import { __ } from '@erxes/ui/src/utils';
import { PopoverButton, PopoverHeader } from '@erxes/ui/src/styles/main';

type Props = {
  trigger: React.ReactNode;
  successCallback?: () => void;
  targets?: any[];
  container?: Element | Node | React.Component<any, {}, any>;
  refetchQueries?: any[];
  singleSelect?: boolean;
  disableTreeView?: boolean;
  perPage?: number;
};

function ConditionPopover(props: Props) {
  const {
    trigger,
    container,
    refetchQueries,
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
        <PopoverHeader>{__('Choose your bundle')}</PopoverHeader>
        <ConditionSelecter
          event='onClick'
          perPage={perPage}
          disableTreeView={disableTreeView}
          {...taggerProps}
          refetchQueries={refetchQueries}
        />
      </Popover.Panel>
    </Popover>
  );
}

export default ConditionPopover;
