import { IFormData } from '@erxes/ui-forms/src/forms/types';
import SelectBrand from '@erxes/ui-inbox/src/settings/integrations/containers/SelectBrand';
import SelectChannels from '@erxes/ui-inbox/src/settings/integrations/containers/SelectChannels';
import SelectDepartments from '@erxes/ui-settings/src/departments/containers/SelectDepartments';
import { LANGUAGES } from '@erxes/ui-settings/src/general/constants';
import { Description } from '@erxes/ui-settings/src/styles';
import { IBrand } from '@erxes/ui/src/brands/types';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import {
  BackgroundSelector,
  FlexItem
} from '@erxes/ui/src/components/step/style';
import { LeftItem } from '@erxes/ui/src/components/step/styles';
import Toggle from '@erxes/ui/src/components/Toggle';
import { IField } from '@erxes/ui/src/types';
import { __ } from 'coreui/utils';
import React from 'react';
import Select from 'react-select-plus';

type Props = {
  onChange: (
    name:
      | 'brand'
      | 'language'
      | 'isRequireOnce'
      | 'channelIds'
      | 'theme'
      | 'saveAsCustomer'
      | 'visibility'
      | 'departmentIds',
    value: any
  ) => void;
  type: string;
  formData: IFormData;
  color: string;
  theme: string;
  title?: string;
  language?: string;
  isRequireOnce?: boolean;
  saveAsCustomer?: boolean;
  fields?: IField[];
  brand?: IBrand;
  channelIds?: string[];
  visibility?: string;
  departmentIds?: string[];
  onFieldEdit?: () => void;
};

type State = {
  language?: string;
};

class OptionStep extends React.Component<Props, State> {
  onChangeFunction = (name: any, value: any) => {
    this.props.onChange(name, value);
  };

  onSelectChange = (e, name) => {
    let value = '';

    if (e) {
      value = e.value;
    }

    this.setState({ [name]: value });
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

  renderDepartments() {
    const { visibility, departmentIds } = this.props;

    if (visibility === 'public') {
      return;
    }

    const departmentOnChange = (values: string[]) => {
      this.onChangeFunction('departmentIds', values);
    };

    return (
      <FormGroup>
        <SelectDepartments
          defaultValue={departmentIds}
          isRequired={false}
          onChange={departmentOnChange}
        />
      </FormGroup>
    );
  }

  render() {
    const {
      language,
      brand,
      isRequireOnce,
      saveAsCustomer,
      formData
    } = this.props;

    const onChange = e =>
      this.onChangeFunction(
        'brand',
        (e.currentTarget as HTMLInputElement).value
      );

    const channelOnChange = (values: string[]) => {
      this.onChangeFunction('channelIds', values);
    };

    const onChangeLanguage = e => this.onSelectChange(e, 'language');

    const onSwitchHandler = e => {
      this.onChangeFunction(e.target.id, e.target.checked);
    };

    const onChangeVisibility = (e: React.FormEvent<HTMLElement>) => {
      const visibility = (e.currentTarget as HTMLInputElement).value;
      this.onChangeFunction('visibility', visibility);
    };

    let renderPayments = false;

    const fields = formData.fields || [];

    if (
      fields &&
      fields.findIndex(f => f.type === 'productCategory' && f.isRequired) !== -1
    ) {
      renderPayments = true;
    }

    return (
      <FlexItem>
        <LeftItem>
          <FormGroup>
            <ControlLabel required={true}>Form Name</ControlLabel>
            <p>
              {__('Name this form to differentiate from the rest internally')}
            </p>

            <FormControl
              id={'popupName'}
              required={true}
              onChange={this.onChangeTitle}
              value={this.props.title}
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
            <ControlLabel required={true}>Visibility</ControlLabel>
            <FormControl
              name="visibility"
              componentClass="select"
              value={this.props.visibility}
              onChange={onChangeVisibility}
            >
              <option value="public">{__('Public')}</option>
              <option value="private">{__('Private')}</option>
            </FormControl>
          </FormGroup>

          {this.renderDepartments()}

          <FormGroup>
            <ControlLabel>Language</ControlLabel>
            <Select
              id="language"
              value={language}
              options={LANGUAGES}
              onChange={onChangeLanguage}
              clearable={false}
            />
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
                id="isRequireOnce"
                checked={isRequireOnce || false}
                onChange={onSwitchHandler}
                icons={{
                  checked: <span>Yes</span>,
                  unchecked: <span>No</span>
                }}
              />
            </div>
          </FormGroup>

          <FormGroup>
            <ControlLabel>Save as customer</ControlLabel>
            <Description>Forcibly turn lead to customer.</Description>
            <br />
            <div>
              <Toggle
                id="saveAsCustomer"
                checked={saveAsCustomer || false}
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
