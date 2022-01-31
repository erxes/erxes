import React from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import Icon from 'modules/common/components/Icon';
import { IOption } from 'modules/common/types';
import { Attributes } from '../styles';
import { __ } from 'modules/common/utils';

type Props = {
  config: any;
  triggerType: string;
  setConfig: (config: any) => void;
  inputName?: string;
  options: IOption[];
  isMulti?: boolean;
};

export default class SelectOption extends React.Component<Props> {
  private overlay: any;

  hideContent = () => {
    this.overlay.hide();
  };

  onChange = item => {
    this.overlay.hide();

    const { config, setConfig, inputName = 'value' } = this.props;

    if (this.props.isMulti) {
      const value: string = config[inputName] || '';
      const re = /(\[\[ \w* \]\])/gi;
      const ids = value.match(re) || [];

      if (!ids.includes(`[[ ${item.value} ]]`)) {
        const comma = config[inputName] ? ', ' : '';

        config[inputName] = `${config[inputName] || ''}${comma}[[ ${
          item.value
        } ]]`;
      }
    } else {
      config[inputName] = `[[ ${item.value} ]]`;
    }

    setConfig(config);
  };

  renderContent() {
    const { options } = this.props;

    return (
      <Popover id="select-option-popover">
        <Attributes>
          <React.Fragment>
            <li>
              <b>Default Options</b>
            </li>
            {options.map(item => (
              <li key={item.label} onClick={this.onChange.bind(this, item)}>
                {item.label}
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
          {__('Options')} <Icon icon="angle-down" />
        </span>
      </OverlayTrigger>
    );
  }
}
