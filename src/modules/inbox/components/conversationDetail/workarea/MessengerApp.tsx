import { Button, Icon, Tip } from "modules/common/components";
import { __ } from "modules/common/utils";
import {
  MessengerApps,
  PopoverBody,
  PopoverList,
  ResponseTemplateStyled
} from "modules/inbox/styles";
import * as React from "react";
import { OverlayTrigger, Popover } from "react-bootstrap";
import { IMessengerApp } from "../../../../settings/integrations/types";

type Props = {
  messengerApps: IMessengerApp[];
  onSelect: (messengerApp?: IMessengerApp) => void;
};

class MessengerApp extends React.Component<Props> {
  private overlayRef;

  constructor(props) {
    super(props);

    this.onSelect = this.onSelect.bind(this);
  }

  onSelect(mesengerAppId: string) {
    const messengerApps = this.props.messengerApps;

    // find response template using event key
    const messengerApp = messengerApps.find(t => t._id === mesengerAppId);

    // hide selector
    this.overlayRef.hide();

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
        title={__("Messenger apps")}
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
          ref={overlayTrigger => {
            this.overlayRef = overlayTrigger;
          }}
        >
          <Button btnStyle="link">
            <Tip text={__("Messenger apps")}>
              <Icon icon="menu" />
            </Tip>
          </Button>
        </OverlayTrigger>
      </ResponseTemplateStyled>
    );
  }
}

export default MessengerApp;
