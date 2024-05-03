import AssignBox from '@erxes/ui-inbox/src/inbox/containers/AssignBox';
import { IConversation } from '@erxes/ui-inbox/src/inbox/types';
import { InboxManagementActionConsumer } from '../../containers/InboxCore';
import { Popover } from '@headlessui/react';
import { PopoverHeader } from '@erxes/ui/src/styles/eindex';
import React from 'react';
import { __ } from '@erxes/ui/src/utils/core';

type Props = {
  targets: IConversation[];
  trigger: React.ReactNode;
  container?: Element | Node | React.Component<any, {}, any>;
  afterSave?: () => void;
  notifyHandler: () => void;
};

class AssignBoxPopover extends React.Component<Props> {
  hidePopover = (closePopover) => {
    const { afterSave, notifyHandler } = this.props;

    if (afterSave) {
      afterSave();
    }

    if (notifyHandler) {
      notifyHandler();
    }

    closePopover();
  };

  render() {
    const { targets, trigger } = this.props;

    const popover = (close) => (
      <>
        <PopoverHeader>{__('Choose person')}</PopoverHeader>
        <div className="popover-content">
          <AssignBox
            targets={targets}
            event="onClick"
            afterSave={() => this.hidePopover(close)}
          />
        </div>
      </>
    );

    return (
      <Popover className="relative">
        <Popover.Button>{trigger}</Popover.Button>
        <Popover.Panel className="assign-popover">
          {({ close }) => popover(close)}
        </Popover.Panel>
      </Popover>
    );
  }
}

export default (props) => (
  <InboxManagementActionConsumer>
    {({ notifyConsumersOfManagementAction }) => (
      <AssignBoxPopover
        {...props}
        notifyHandler={notifyConsumersOfManagementAction}
      />
    )}
  </InboxManagementActionConsumer>
);
