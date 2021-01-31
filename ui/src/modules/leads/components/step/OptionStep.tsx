import FormControl from 'modules/common/components/form/Control';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { LeftItem, Preview } from 'modules/common/components/step/styles';
import Toggle from 'modules/common/components/Toggle';
import FieldsPreview from 'modules/forms/components/FieldsPreview';
import { IFormData } from 'modules/forms/types';
import SelectBrand from 'modules/settings/integrations/containers/SelectBrand';
import { IField } from 'modules/settings/properties/types';
import { Description } from 'modules/settings/styles';
import React from 'react';
import { IBrand } from '../../../settings/brands/types';
import { FormPreview } from './preview';
import { FlexItem } from './style';
import SelectChannels from 'modules/settings/integrations/containers/SelectChannels';

type Props = {
  type: string;
  formData: IFormData;
  color: string;
  theme: string;
  language?: string;
  isRequireOnce?: boolean;
  onChange: (
    name: 'brand' | 'language' | 'isRequireOnce' | 'channelIds',
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

  render() {
    const {
      language,
      brand,
      formData,
      isRequireOnce
    } = this.props;
    const { fields, desc } = formData;

    const onChange = e =>
      this.onChangeFunction(
        'brand',
        (e.currentTarget as HTMLInputElement).value
      );

    const channelOnChange = (values: string[]) => {
      this.onChangeFunction('channelIds', values);
    }

    const onChangeLanguage = e =>
      this.onChangeFunction(
        'language',
        (e.currentTarget as HTMLInputElement).value
      );

    const previewRenderer = () => (
      <FieldsPreview fields={fields || []} formDesc={desc} />
    );

    const onSwitchHandler = e => {
      this.onChangeFunction('isRequireOnce', e.target.checked);
    };

    return (
      <FlexItem>
        <LeftItem>
          <FormGroup>
            <SelectBrand
              isRequired={true}
              onChange={onChange}
              defaultValue={brand ? brand._id : ' '}
            />
          </FormGroup>

          <SelectChannels
            defaultValue={this.props.channelIds}
            isRequired={true}
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
            <ControlLabel>Submit once</ControlLabel>
            <Description>
              Turn on to receive a submission from the visitor only once. Once a
              submission is received, the popup will not show.
            </Description>
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

        <Preview>
          <FormPreview
            {...this.props}
            title={formData.title}
            btnText={formData.btnText}
            previewRenderer={previewRenderer}
          />
        </Preview>
      </FlexItem>
    );
  }
}

export default OptionStep;
