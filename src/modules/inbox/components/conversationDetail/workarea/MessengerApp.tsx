/* eslint-disable react/no-string-refs */

import { Button, Icon, Tip } from 'modules/common/components';
import { __ } from 'modules/common/utils';
import {
  MessengerApps,
  PopoverBody,
  PopoverList,
  ResponseTemplateStyled
} from 'modules/inbox/styles';
import * as React from 'react';
import { OverlayTrigger, Popover } from 'react-bootstrap';

type Props = {
  messengerApps: any;
  onSelect: (eventKey: string) => void;
};

class MessengerApp extends React.Component<Props> {
  constructor(props) {
    super(props);

    this.onSelect = this.onSelect.bind(this);
  }

  onSelect(eventKey) {
    const messengerApps = this.props.messengerApps;

    // find response template using event key
    const messengerApp = messengerApps.find(t => t._id === eventKey);

    // hide selector
    this.refs.overlay.hide();

    return this.props.onSelect(messengerApp);
  }

  renderItems() {
    return this.props.messengerApps.map(item => (
      <li key={item._id} onClick={() => this.onSelect(item._id)}>
        <MessengerApps>
          <img src="/images/integrations/google-meet.png" alt="google-meet" />
          <div>
            <h5>{item.name}</h5>
            <p>Start a video call from your conversation</p>
          </div>
        </MessengerApps>
      </li>
    ));
  }

  render() {
    const popover = (
      <Popover
        className="popover-template"
        id="templates-popover"
        title={__('Messenger apps')}
      >
        <PopoverBody>
          <PopoverList>{this.renderItems()}</PopoverList>
        </PopoverBody>
      </Popover>
    );

    return (
      <ResponseTemplateStyled>
        <OverlayTrigger
          trigger="click"
          placement="top"
          overlay={popover}
          rootClose
          ref="overlay"
        >
          <Button btnStyle="link">
            <Tip text={__('Messenger apps')}>
              <Icon icon="menu" />
            </Tip>
          </Button>
        </OverlayTrigger>
      </ResponseTemplateStyled>
    );
  }
}

export default MessengerApp;
