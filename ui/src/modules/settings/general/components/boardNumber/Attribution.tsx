import Icon from 'modules/common/components/Icon';
import React from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import { Attributes } from '../styles';
import { Alert, __ } from 'modules/common/utils';

type Props = {
  config: any;
  setConfig: (config: any) => void;
  inputName: string;
  attributions: any[];
  onlySet?: boolean;
};

export default class Attribution extends React.Component<Props> {
  private overlay: any;

  hideContent = () => {
    this.overlay.hide();
  };

  onClickAttribute = item => {
    this.overlay.hide();
    const { config, setConfig, inputName } = this.props;

    const value = item.value;

    if (
      config[inputName] &&
      config[inputName].includes('number') &&
      item.value !== 'number'
    ) {
      return Alert.error(
        'You cannot add an attribute after the number attribute!'
      );
    }

    if (value === '_' || value === '-' || value === '/' || value === ' ') {
      config[inputName] = `${config[inputName]}${value}`;
    } else {
      config[inputName] = `${config[inputName] || ''}{${value}}`;
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
