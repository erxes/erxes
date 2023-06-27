import { __ } from '@erxes/ui/src/utils/core';
import AssignBox from '@erxes/ui-inbox/src/inbox/containers/AssignBox';
import React from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import { InboxManagementActionConsumer } from '../../containers/InboxCore';
import { IConversation } from '@erxes/ui-inbox/src/inbox/types';

type Props = {
  targets: IConversation[];
  trigger: React.ReactNode;
  container?: Element | Node | React.Component<any, {}, any>;
  afterSave?: () => void;
  notifyHandler: () => void;
};

class AssignBoxPopover extends React.Component<Props> {
  private overlayTrigger;

  hidePopover = () => {
    const { afterSave, notifyHandler } = this.props;

    if (afterSave) {
      afterSave();
    }

    if (notifyHandler) {
      notifyHandler();
    }

    this.overlayTrigger.hide();
  };

  render() {
    const { targets, trigger, container } = this.props;
    const popover = (
      <Popover id="assign-popover">
        <Popover.Title as="h3">{__('Choose person')}</Popover.Title>
        <Popover.Content>
          <AssignBox
            targets={targets}
            event="onClick"
            afterSave={this.hidePopover}
          />
        </Popover.Content>
      </Popover>
    );

    return (
      <OverlayTrigger
        ref={overlayTrigger => {
          this.overlayTrigger = overlayTrigger;
        }}
        trigger="click"
        placement="bottom-start"
        overlay={popover}
        container={container}
        rootClose={true}
      >
        {trigger}
      </OverlayTrigger>
    );
  }
}

export default props => (
  <InboxManagementActionConsumer>
    {({ notifyConsumersOfManagementAction }) => (
      <AssignBoxPopover
        {...props}
        notifyHandler={notifyConsumersOfManagementAction}
      />
    )}
  </InboxManagementActionConsumer>
);
