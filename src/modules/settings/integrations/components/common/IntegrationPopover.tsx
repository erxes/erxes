import { FilterableList } from 'modules/common/components';
import { __ } from 'modules/common/utils';
import * as React from 'react';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import { IIntegration } from '../../types';

type Props = {
  targets: IIntegration[];
  trigger: React.ReactNode;
  title: string;
};

class IntegrationPopover extends React.Component<Props> {
  private overlayTrigger;

  hidePopover = () => {
    this.overlayTrigger.hide();
  };

  renderPopover() {
    const { title, targets } = this.props;

    return (
      <Popover id="integration-popover" title={__(title)}>
        <FilterableList
          items={targets}
          onClick={this.hidePopover}
          showCheckmark={false}
        />
      </Popover>
    );
  }

  render() {
    const { trigger } = this.props;

    return (
      <OverlayTrigger
        ref={overlayTrigger => {
          this.overlayTrigger = overlayTrigger;
        }}
        trigger="click"
        placement="bottom"
        overlay={this.renderPopover()}
        container={this}
        rootClose={true}
      >
        {trigger}
      </OverlayTrigger>
    );
  }
}

export default IntegrationPopover;
