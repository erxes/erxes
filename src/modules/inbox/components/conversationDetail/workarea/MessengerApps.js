/* eslint-disable react/no-string-refs */

import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Popover, OverlayTrigger } from 'react-bootstrap';
import { Button, Icon, Tip } from 'modules/common/components';
import {
  ResponseTemplateStyled,
  PopoverBody,
  PopoverList,
  MessengerApps
} from 'modules/inbox/styles';

const propTypes = {
  messengerApps: PropTypes.array.isRequired,
  onSelect: PropTypes.func
};

class Apps extends Component {
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

  renderItem(item) {
    if (item.kind === 'googleMeet') {
      return (
        <Fragment>
          <img src="/images/integrations/google-meet.png" alt="google-meet" />

          <div>
            <h5>{item.name}</h5>
            <p>Start a video call from your conversation</p>
          </div>
        </Fragment>
      );
    }
  }

  renderItems() {
    return this.props.messengerApps.map(item => (
      <li key={item._id} onClick={() => this.onSelect(item._id)}>
        <MessengerApps>{this.renderItem(item)}</MessengerApps>
      </li>
    ));
  }

  render() {
    const { __ } = this.context;

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

Apps.propTypes = propTypes;
Apps.contextTypes = {
  __: PropTypes.func
};

export default Apps;
