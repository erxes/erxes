import React from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';

import Icon from 'modules/common/components/Icon';
import { ATTRIBUTIONS } from './constants';
import { Attributes } from 'modules/automations/styles';

type Props = {
  config: any;
  setConfig: (config: any) => void;
  inputName?: string;
};

export default class Attribution extends React.Component<Props> {
  // private ref;
  private overlay: any;

  hideContent = () => {
    this.overlay.hide();
  };

  onClickAttribute = item => {
    this.overlay.hide();

    const { config, setConfig, inputName = 'value' } = this.props;
    config[inputName] = `${config[inputName] || ''} {{ ${item.value} }}`;

    setConfig(config);
  };

  renderContent() {
    return (
      <Popover id="attribute-popover">
        <Attributes>
          {Object.keys(ATTRIBUTIONS).map((key, index) => {
            const title = key;
            const items = ATTRIBUTIONS[key];

            return (
              <React.Fragment key={index}>
                <b>{title}</b>
                {items.map(item => (
                  <li
                    key={item.value}
                    onClick={this.onClickAttribute.bind(this, item)}
                  >
                    {item.label}
                  </li>
                ))}
              </React.Fragment>
            );
          })}
        </Attributes>
      </Popover>
    );
  }

  render() {
    return (
      <OverlayTrigger
        ref={overlay => {
          this.overlay = overlay;
        }}
        trigger="click"
        placement="top"
        overlay={this.renderContent()}
        rootClose={true}
        container={this}
      >
        <span>
          Attribution <Icon icon="angle-down" />
        </span>
      </OverlayTrigger>
    );
  }
}
