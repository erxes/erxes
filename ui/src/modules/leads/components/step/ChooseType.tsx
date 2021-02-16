import { COLORS } from 'modules/boards/constants';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import Icon from 'modules/common/components/Icon';
import { LeftItem } from 'modules/common/components/step/styles';
import { __ } from 'modules/common/utils';
import { ColorPick, ColorPicker, Description } from 'modules/settings/styles';
import React from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import TwitterPicker from 'react-color/lib/Twitter';
import { BackgroundSelector, Box, BoxRow, FlexItem } from './style';

type Props = {
  type: string;
  onChange: (name: 'type' | 'color' | 'theme', value: string) => void;
  calloutTitle?: string;
  calloutBtnText?: string;
  color: string;
  theme: string;
};

class ChooseType extends React.Component<Props, {}> {
  renderBox(name: string, icon: string, value: string) {
    const onClick = () => this.onChange(value);

    return (
      <Box selected={this.props.type === value} onClick={onClick}>
        <Icon icon={icon} />
        <span>{__(name)}</span>
      </Box>
    );
  }

  onChange(value: string) {
    return this.props.onChange('type', value);
  }

  onColorChange = e => {
    this.setState({ color: e.hex, theme: '#000' }, () => {
      this.props.onChange('color', e.hex);
      this.props.onChange('theme', e.hex);
    });
  };

  renderThemeColor(value: string) {
    const onClick = () => this.props.onChange('theme', value);

    return (
      <BackgroundSelector
        key={value}
        selected={this.props.theme === value}
        onClick={onClick}
      >
        <div style={{ backgroundColor: value }} />
      </BackgroundSelector>
    );
  }

  render() {
    const { color, theme } = this.props;

    const popoverTop = (
      <Popover id="color-picker">
        <TwitterPicker
          width="266px"
          triangle="hide"
          colors={COLORS}
          color={color}
          onChange={this.onColorChange}
        />
      </Popover>
    );

    return (
      <FlexItem>
        <LeftItem>
          <FormGroup>
            <ControlLabel>Theme color</ControlLabel>
            <Description>Try some of these colors</Description>
            <br />
            <div>
              <OverlayTrigger
                trigger="click"
                rootClose={true}
                placement="bottom-start"
                overlay={popoverTop}
              >
                <ColorPick>
                  <ColorPicker style={{ backgroundColor: theme }} />
                </ColorPick>
              </OverlayTrigger>
            </div>
          </FormGroup>

          <FormGroup>
            <ControlLabel>Choose a flow type</ControlLabel>
          </FormGroup>
          <BoxRow>
            {this.renderBox('ShoutBox', 'comment-1', 'shoutbox')}
            {this.renderBox('Popup', 'window', 'popup')}
          </BoxRow>

          <BoxRow>
            {this.renderBox('Embedded', 'focus', 'embedded')}
            {this.renderBox('Dropdown', 'arrow-from-top', 'dropdown')}
          </BoxRow>

          <BoxRow>
            {this.renderBox('Slide-in Left', 'arrow-from-right', 'slideInLeft')}
            {this.renderBox(
              'Slide-in Right',
              'left-arrow-from-left',
              'slideInRight'
            )}
          </BoxRow>
        </LeftItem>
      </FlexItem>
    );
  }
}

export default ChooseType;
