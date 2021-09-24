import React from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import Icon from 'modules/common/components/Icon';
import { FieldsCombinedByType } from 'modules/settings/properties/types';
import { Attributes } from './styles';

type Props = {
  config: any;
  triggerType: string;
  setConfig: (config: any) => void;
  inputName?: string;
  attributions: FieldsCombinedByType[];
};

export default class Attribution extends React.Component<Props> {
  private overlay: any;

  hideContent = () => {
    this.overlay.hide();
  };

  onClickAttribute = item => {
    this.overlay.hide();

    const { config, setConfig, inputName = 'value' } = this.props;
    config[inputName] = `${config[inputName] || ''} {{ ${item.name} }}`;

    setConfig(config);
  };

  renderContent() {
    const { attributions } = this.props;
    return (
      <Popover id="attribute-popover">
        <Attributes>
          <React.Fragment>
            <li>
              <b>Attributions</b>
            </li>
            {attributions.map(item => (
              <li
                key={item.name}
                onClick={this.onClickAttribute.bind(this, item)}
              >
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
          Attribution <Icon icon="angle-down" />
        </span>
      </OverlayTrigger>
    );
  }
}
