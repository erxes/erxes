import Icon from 'modules/common/components/Icon';
import React from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import { Attributes } from '../../styles';
import { __ } from 'modules/common/utils';

type Props = {
  config: string;
  setConfig: (config: string) => void;
  attributions: any[];
};

export default class Attribution extends React.Component<Props> {
  private overlay: any;

  hideContent = () => {
    this.overlay.hide();
  };

  onClickAttribute = item => {
    this.overlay.hide();
    const { setConfig } = this.props;
    let { config } = this.props;

    const characters = ['_', '-', '/', ' '];

    const value = item.value;

    if (characters.includes(value)) {
      config = `${config}${value}`;
    } else {
      config = `${config}{${value}}`;
    }

    setConfig(config);
  };

  renderContent() {
    const { attributions } = this.props;

    return (
      <Popover id="attribute-popover">
        <Attributes>
          <React.Fragment>
            <li>
              <b>{__('Attributions')}</b>
            </li>
            {attributions.map(item => (
              <li
                key={item.value}
                onClick={this.onClickAttribute.bind(this, item)}
              >
                {__(item.label)}
              </li>
            ))}
          </React.Fragment>
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
          {__('Attribution')} <Icon icon="angle-down" />
        </span>
      </OverlayTrigger>
    );
  }
}
