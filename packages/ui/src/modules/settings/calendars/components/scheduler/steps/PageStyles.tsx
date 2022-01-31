import FormControl from 'modules/common/components/form/Control';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { FlexItem, LeftItem } from 'modules/common/components/step/styles';
import { __ } from 'modules/common/utils';
import { ColorPick, ColorPicker, SubItem } from 'modules/settings/styles';
import React from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import TwitterPicker from 'react-color/lib/Twitter';

type NameInput =
  | 'companyName'
  | 'slug'
  | 'color'
  | 'submitText'
  | 'thankYouText';

type Props = {
  onChange: (name: NameInput, value: string) => void;
  companyName?: string;
  slug?: string;
  color?: string;
  submitText?: string;
  thankYouText?: string;
};

type State = {
  companyName?: string;
  slug?: string;
  color?: string;
  submitText?: string;
  thankYouText?: string;
};

class PageStyles extends React.Component<Props, State> {
  onChangeInput = (name: NameInput, e: React.FormEvent) => {
    const { value } = e.target as HTMLInputElement;

    this.setState({ [name]: value }, () => this.props.onChange(name, value));
  };

  onChangeColor = (name: 'color', e: any) => {
    const value = e.hex;

    this.setState({ [name]: value }, () => this.props.onChange(name, value));
  };

  renderField = (name: NameInput, label: string) => {
    return (
      <FormGroup>
        <ControlLabel>{label}</ControlLabel>

        <FormControl
          value={this.props[name]}
          onChange={this.onChangeInput.bind(null, name)}
        />
      </FormGroup>
    );
  };

  render() {
    const { color } = this.props;

    const popoverContent = (
      <Popover id="color-picker">
        <TwitterPicker
          color={color}
          onChange={this.onChangeColor.bind(null, 'color')}
          triangle="hide"
        />
      </Popover>
    );

    return (
      <FlexItem>
        <LeftItem>
          {this.renderField('companyName', 'Company name')}

          <SubItem>
            <ControlLabel>{__('Choose a background color')}</ControlLabel>
            <OverlayTrigger
              trigger="click"
              rootClose={true}
              placement="bottom-start"
              overlay={popoverContent}
            >
              <ColorPick>
                <ColorPicker style={{ backgroundColor: color }} />
              </ColorPick>
            </OverlayTrigger>
          </SubItem>

          {this.renderField('slug', 'Custom page slug')}
          {this.renderField('submitText', 'Submit button label')}
          {this.renderField('thankYouText', 'Thank you message')}
        </LeftItem>
      </FlexItem>
    );
  }
}

export default PageStyles;
