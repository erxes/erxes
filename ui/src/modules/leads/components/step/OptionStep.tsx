import FormControl from 'modules/common/components/form/Control';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { LeftItem } from 'modules/common/components/step/styles';
import Toggle from 'modules/common/components/Toggle';
import { __ } from 'modules/common/utils';
import { IFormData } from 'modules/forms/types';
import SelectBrand from 'modules/settings/integrations/containers/SelectBrand';
import SelectChannels from 'modules/settings/integrations/containers/SelectChannels';
import { IField } from 'modules/settings/properties/types';
import { Description } from 'modules/settings/styles';
import React from 'react';
import { IBrand } from '../../../settings/brands/types';
import { BackgroundSelector, FlexItem } from './style';

type Props = {
  type: string;
  formData: IFormData;
  color: string;
  theme: string;
  title?: string;
  language?: string;
  isRequireOnce?: boolean;
  onChange: (
    name: 'brand' | 'language' | 'isRequireOnce' | 'channelIds' | 'theme',

    value: any
  ) => void;
  fields?: IField[];
  brand?: IBrand;
  channelIds?: string[];
  onFieldEdit?: () => void;
};

class OptionStep extends React.Component<Props, {}> {
  onChangeFunction = (name: any, value: any) => {
    this.props.onChange(name, value);
  };

  onChangeTitle = e =>
    this.onChangeFunction('title', (e.currentTarget as HTMLInputElement).value);

  renderThemeColor(value: string) {
    const onClick = () => this.onChangeFunction('theme', value);

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
    const { language, brand, isRequireOnce } = this.props;

    const onChange = e =>
      this.onChangeFunction(
        'brand',
        (e.currentTarget as HTMLInputElement).value
      );

    const channelOnChange = (values: string[]) => {
      this.onChangeFunction('channelIds', values);
    };

    const onChangeLanguage = e =>
      this.onChangeFunction(
        'language',
        (e.currentTarget as HTMLInputElement).value
      );

    const onSwitchHandler = e => {
      this.onChangeFunction('isRequireOnce', e.target.checked);
    };

    return (
      <FlexItem>
        <LeftItem>
          <FormGroup>
            <ControlLabel required={true}>Form Name</ControlLabel>
            <p>
              {__('Name this form to differentiate from the rest internally')}
            </p>

            <FormControl
              required={true}
              onChange={this.onChangeTitle}
              defaultValue={this.props.title}
              autoFocus={true}
            />
          </FormGroup>
          <FormGroup>
            <SelectBrand
              isRequired={true}
              onChange={onChange}
              defaultValue={brand ? brand._id : ' '}
            />
          </FormGroup>

          <SelectChannels
            defaultValue={this.props.channelIds}
            isRequired={false}
            description="Choose a channel, if you wish to see every new form in your Team Inbox."
            onChange={channelOnChange}
          />
          <FormGroup>
            <ControlLabel>Language</ControlLabel>
            <FormControl
              componentClass="select"
              defaultValue={language}
              id="languageCode"
              onChange={onChangeLanguage}
            >
              <option />
              <option value="mn">Монгол</option>
              <option value="en">English</option>
            </FormControl>
          </FormGroup>

          <FormGroup>
            <ControlLabel>Limit to 1 response</ControlLabel>
            <Description>
              Turn on to receive a submission from the visitor only once. Once a
              submission is received, the form will not display again.
            </Description>
            <br />
            <div>
              <Toggle
                checked={isRequireOnce || false}
                onChange={onSwitchHandler}
                icons={{
                  checked: <span>Yes</span>,
                  unchecked: <span>No</span>
                }}
              />
            </div>
          </FormGroup>
        </LeftItem>
      </FlexItem>
    );
  }
}

export default OptionStep;
